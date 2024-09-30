import { Injectable } from "@nestjs/common";
import {
  RoomCreateDto,
  RoomModel,
  RoomStatus,
} from "src/common/models/room.model";
import { UserModel } from "src/common/models/user.model";
import { UserService } from "./user.service";
import { PlayerModel } from "src/common/models/player.model";
import { PlayerRole, Position } from "src/common/models/common.types";

@Injectable()
export class RoomService {
  public rooms: RoomModel[] = [];

  constructor(private userService: UserService) {
    //
    this.rooms = [
      // default room
      new RoomModel({ name: "default" }),
    ];
  }

  create(roomCreate: RoomCreateDto): RoomModel {
    if (this.rooms.find((room) => room.name === roomCreate.name)) {
      throw new Error(`Room with name ${roomCreate.name} already exists.`);
    }

    const room = new RoomModel(roomCreate);
    this.rooms.push(room);
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
    if (room.findPlayerByPosition(position)) {
      throw new Error(`Position ${position} is already taken.`);
    }

    // user must not in any rooms
    for (const room of this.rooms) {
      if (room.findPlayer(user.name)) {
        throw new Error(`User ${user.name} is already in room ${room.name}.`);
      }
    }

    // add user to room
    const player = new PlayerModel(user, room, position, role);
    room.players.push(player);

    // send event to all subscribers
    // ...

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
    room.players = room.players.filter(
      (player) => player.userName !== user.name,
    );

    // send event to all subscribers
    // ...
  }
}
