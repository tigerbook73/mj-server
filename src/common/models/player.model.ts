import type { PlayerRole, UserType } from "./common.types";
import type { Position } from "../core/mj.game";

/**
 * Represents a user in one game.
 */
export class PlayerModel {
  constructor(
    public userName: string, // user name
    public roomName: string, // room name
    public role: PlayerRole, // player role: Player or Observer
    public type: UserType, // player type: Human or Bot
    public position: Position, // player position: East, West, North, South
  ) {}

  // only for client side
  static fromJSON(data: any): PlayerModel {
    const player = new PlayerModel(
      data.userName,
      data.roomName,
      data.role,
      data.type,
      data.position,
    );
    return player;
  }

  toJSON() {
    return {
      userName: this.userName,
      roomName: this.roomName,
      role: this.role,
      type: this.type,
      position: this.position,
    };
  }
}
