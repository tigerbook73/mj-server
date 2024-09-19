import { Position } from "./common.types";
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

  constructor(roomCreate: RoomCreateDto) {
    this.name = roomCreate.name;
    this.state = RoomStatus.Open;
    this.players = [];
  }

  findPlayer(userName: string): PlayerModel {
    return this.players.find((player) => player.userName === userName) ?? null;
  }

  findPlayerByPosition(position: Position): PlayerModel {
    return this.players.find((player) => player.position === position) ?? null;
  }
}
