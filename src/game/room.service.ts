import { Injectable, Logger } from "@nestjs/common";
import {
  RoomCreateDto,
  RoomModel,
  RoomStatus,
} from "src/common/models/room.model";
import { UserModel } from "src/common/models/user.model";
import { UserService } from "./user.service";
import { PlayerModel } from "src/common/models/player.model";
import { PlayerRole, UserType } from "src/common/models/common.types";
import { Game, Position } from "src/common/core/mj.game";
import { Interval } from "@nestjs/schedule";
import { ClientService } from "./client.service";

@Injectable()
export class RoomService {
  public rooms: RoomModel[] = [];
  public userDropList: { user: UserModel; expiresAt: EpochTimeStamp }[] = [];

  private readonly logger = new Logger(RoomService.name);

  constructor(
    private userService: UserService,
    private clientService: ClientService,
  ) {
    // default room
    this.create({ name: "room-1" });
    this.create({ name: "room-2" });
  }

  resetRoom(room: RoomModel): void {
    room.state = RoomStatus.Open;
    room.players = [
      new PlayerModel(
        (this.userService.findBot(Position.East) as UserModel).name,
        room.name,
        PlayerRole.Player,
        UserType.Bot,
        Position.East,
      ),
      new PlayerModel(
        (this.userService.findBot(Position.South) as UserModel).name,
        room.name,
        PlayerRole.Player,
        UserType.Bot,
        Position.South,
      ),
      new PlayerModel(
        (this.userService.findBot(Position.West) as UserModel).name,
        room.name,
        PlayerRole.Player,
        UserType.Bot,
        Position.West,
      ),
      new PlayerModel(
        (this.userService.findBot(Position.North) as UserModel).name,
        room.name,
        PlayerRole.Player,
        UserType.Bot,
        Position.North,
      ),
    ];
    room.game = null;
  }

  create(roomCreate: RoomCreateDto): RoomModel {
    if (this.rooms.find((room) => room.name === roomCreate.name)) {
      throw new Error(`Room with name ${roomCreate.name} already exists.`);
    }

    const room = RoomModel.create(roomCreate);
    this.rooms.push(room);

    this.resetRoom(room);
    return room;
  }

  find(name: string): RoomModel | null {
    return this.rooms.find((room) => room.name === name) ?? null;
  }

  findAll(): RoomModel[] {
    return this.rooms;
  }

  findByUser(user: UserModel): RoomModel | null {
    return this.rooms.find((room) => room.findPlayer(user.name)) ?? null;
  }

  delete(roomDelete: RoomModel): void {
    // check whether room can be deleted
    if (
      roomDelete.state !== RoomStatus.Open &&
      roomDelete.state !== RoomStatus.Finished
    ) {
      throw new Error(
        `Room ${roomDelete.name} in status ${roomDelete.state} cannot be deleted.`,
      );
    }

    // send event to all subscribers
    // ...

    this.rooms = this.rooms.filter((room) => room.name !== roomDelete.name);
  }

  joinRoom(
    user: UserModel,
    room: RoomModel,
    position: Position,
    role = PlayerRole.Player,
  ): PlayerModel {
    // room must be open
    if (room.state !== RoomStatus.Open) {
      throw new Error(`Room ${room.name} is not open.`);
    }

    // position must be available
    const currentPlayer = room.findPlayerByPosition(position);
    if (currentPlayer?.type !== UserType.Bot) {
      throw new Error(`Position ${position} is already taken.`);
    }

    // user must not in any rooms
    for (const room of this.rooms) {
      if (room.findPlayer(user.name)) {
        throw new Error(`User ${user.name} is already in room ${room.name}.`);
      }
    }

    // remove robot player from room
    room.players = room.players.filter(
      (player) => player.position !== currentPlayer.position,
    );

    // add user to room
    const player = new PlayerModel(
      user.name,
      room.name,
      role,
      UserType.Human,
      position,
    );
    room.players.push(player);

    return player;
  }

  leaveRoom(user: UserModel): void {
    // find room
    let room: RoomModel | undefined;
    let player: PlayerModel | undefined;
    for (const r of this.rooms) {
      player = r.findPlayer(user.name);
      if (player) {
        room = r;
        break;
      }
    }

    // user must be in a room
    if (!room || !player) {
      return;
    }

    // room must be open
    if (room.state !== RoomStatus.Open) {
      throw new Error(`Room ${room.name} is not open.`);
    }

    // remove user from room
    room.players = room.players.filter((p) => p.userName !== player.userName);
    room.players.push(
      new PlayerModel(
        (this.userService.findBot(player.position) as UserModel).name,
        room.name,
        PlayerRole.Observer,
        UserType.Bot,
        player.position,
      ),
    );

    // send event to all subscribers
    // ...
  }

  enterGame(room: RoomModel): RoomModel {
    // room must be open
    if (room.state !== RoomStatus.Open) {
      throw new Error(`Room ${room.name} is not open.`);
    }

    const positions = room.players
      // .filter((player) => player.type === UserType.Human)
      .map((player) => player.position);

    // create game
    room.game = new Game();
    room.game.init(positions);

    // change room status
    room.state = RoomStatus.Started;
    return room;
  }

  quitGame(room: RoomModel): RoomModel {
    // room must be started
    if (room.state !== RoomStatus.Started) {
      throw new Error(`Room ${room.name} is not started.`);
    }

    // quit game
    room.game = null;
    room.state = RoomStatus.Open;

    return room;
  }

  dropUser(user: UserModel): void {
    // drop user from all open rooms, if game is started, stop the game
    this.findAll().forEach((room) => {
      const player = room.findPlayer(user.name);
      if (!player) {
        return;
      }

      if (room.state === RoomStatus.Started) {
        this.quitGame(room);
        // goto RoomStatus.Open
      }

      if (room.state === RoomStatus.Open) {
        this.leaveRoom(user);
      }
    });
  }

  addUserDropList(user: UserModel): void {
    if (!this.userDropList.find((u) => u.user.name === user.name)) {
      this.userDropList.push({
        user,
        expiresAt: Date.now() / 1000 + 30, // 30 seconds
      });
      this.logger.log(`User ${user.name} added to drop list.`);
    }
  }

  @Interval(2000)
  checkUserDropList(): void {
    const newList = [];
    for (const u of this.userDropList) {
      if (this.clientService.findByUser(u.user.name)) {
        this.logger.log(`User ${u.user.name} removed from drop list.`);
        continue;
      }

      if (u.expiresAt <= Date.now() / 1000) {
        this.dropUser(u.user);
        this.logger.log(`User ${u.user.name} is dropped.`);
        continue;
      }

      newList.push(u);
    }

    this.userDropList = newList;
  }
}
