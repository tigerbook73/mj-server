import { RoomModel } from "./room.model";
import { UserModel } from "./user.model";
import { PlayerRole, Position } from "./common.types";

/**
 * Represents a user in one game.
 */
export class PlayerModel {
  userName: string; // user name
  roomName: string; // room name
  role: PlayerRole; // player role
  position: Position;

  constructor(
    user: UserModel,
    room: RoomModel,
    position: Position,
    role = PlayerRole.Player,
  ) {
    this.userName = user.name;
    this.roomName = room.name;
    this.role = role;
    this.position = position;
  }
}
