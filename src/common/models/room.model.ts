import { PlayerPosition } from "./common.types";
import { MjGameModel } from "./mj.game.model";
import { PlayerModel } from "./player.model";

export interface RoomCreateDto {
  name: string;
}

export enum RoomStatus {
  Open = "open",
  Started = "started",
  Finished = "finished",
}

export class RoomModel {
  name: string;
  state: RoomStatus;
  players: PlayerModel[];
  game: MjGameModel;

  constructor(roomCreate: RoomCreateDto) {
    this.name = roomCreate.name;
    this.state = RoomStatus.Open;
    this.players = [];
    this.game = null;
  }

  findPlayer(userName: string): PlayerModel {
    return this.players.find((player) => player.userName === userName) ?? null;
  }

  findPlayerByPosition(position: PlayerPosition): PlayerModel {
    return this.players.find((player) => player.position === position) ?? null;
  }
}
