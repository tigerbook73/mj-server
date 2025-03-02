import { Injectable } from "@nestjs/common";
import {
  RoomCreateDto,
  RoomModel,
  RoomStatus,
} from "src/common/models/room.model";
import { UserModel } from "src/common/models/user.model";
import { UserService } from "./user.service";
import { PlayerModel } from "src/common/models/player.model";
import { PlayerRole, UserType } from "src/common/models/common.types";
import { GameService } from "./game.service";
import { Game, Position } from "src/common/core/mj.game";

@Injectable()
export class RoomService {
  public rooms: RoomModel[] = [];

  constructor(
    private userService: UserService,
    private gameService: GameService,
  ) {
    // default room
    this.create({ name: "room-1" });
    this.create({ name: "room-2" });
  }

  resetRoom(room: RoomModel): void {
    room.state = RoomStatus.Open;
    room.players = [
      new PlayerModel(
        this.userService.findBot(Position.East),
        room,
        Position.East,
      ),
      new PlayerModel(
        this.userService.findBot(Position.South),
        room,
        Position.South,
      ),
      new PlayerModel(
        this.userService.findBot(Position.West),
        room,
        Position.West,
      ),
      new PlayerModel(
        this.userService.findBot(Position.North),
        room,
        Position.North,
      ),
    ];
    room.game = null;
  }

  create(roomCreate: RoomCreateDto): RoomModel {
    if (this.rooms.find((room) => room.name === roomCreate.name)) {
      throw new Error(`Room with name ${roomCreate.name} already exists.`);
    }

    const room = new RoomModel(roomCreate);
    this.rooms.push(room);

    this.resetRoom(room);
    return room;
  }

  find(name: string): RoomModel {
    return this.rooms.find((room) => room.name === name) ?? null;
  }

  findAll(): RoomModel[] {
    return this.rooms;
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
    if (currentPlayer.type !== UserType.Bot) {
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
    const player = new PlayerModel(user, room, position, role);
    room.players.push(player);

    return player;
  }

  leaveRoom(user: UserModel): void {
    // find room
    let room: RoomModel;
    for (const r of this.rooms) {
      if (r.findPlayer(user.name)) {
        room = r;
        break;
      }
    }

    // user must be in a room
    if (!room) {
      return;
    }

    // room must be open
    if (room.state !== RoomStatus.Open) {
      throw new Error(`Room ${room.name} is not open.`);
    }

    // remove user from room
    const playerToRemove = room.findPlayer(user.name);
    room.players = room.players.filter(
      (player) => player.userName !== playerToRemove.userName,
    );
    room.players.push(
      new PlayerModel(
        this.userService.findBot(playerToRemove.position),
        room,
        playerToRemove.position,
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
      .filter((player) => player.type === UserType.Human)
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

      if (room.state === RoomStatus.Open) {
        this.leaveRoom(user);
        return;
      }

      if (room.state === RoomStatus.Started) {
        this.quitGame(room);
      }
    });
  }
}
