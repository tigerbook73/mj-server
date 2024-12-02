import { RoomModel } from "./room.model";
import { UserModel } from "./user.model";
import { PlayerRole, UserType, PlayerPosition } from "./common.types";

/**
 * Represents a user in one game.
 */
export class PlayerModel {
  userName: string; // user name
  roomName: string; // room name
  role: PlayerRole; // player role: Player or Observer
  type: UserType; // player type: Human or Bot
  position: PlayerPosition; // player position: East, West, North, South

  constructor(
    user: UserModel,
    room: RoomModel,
    position: PlayerPosition,
    role = PlayerRole.Player,
  ) {
    this.userName = user.name;
    this.roomName = room.name;
    this.position = position;
    this.role = role;
    this.type = user.type;
  }
}
