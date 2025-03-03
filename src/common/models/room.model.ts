import { Game, Position } from "../core/mj.game";
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
  game?: Game;

  constructor(roomCreate: RoomCreateDto) {
    this.name = roomCreate.name;
    this.state = RoomStatus.Open;
    this.players = [];
    this.game = undefined;
  }

  findPlayer(userName: string): PlayerModel | undefined {
    return this.players.find((player) => player.userName === userName);
  }

  findPlayerByPosition(position: Position): PlayerModel | undefined {
    return this.players.find((player) => player.position === position);
  }
}
