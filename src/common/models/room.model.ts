import { Game, Position } from "../core/mj.game";
import { PlayerModel } from "./player.model";

export interface RoomCreateDto {
  name: string;
}

export const enum RoomStatus {
  Open = "open",
  Started = "started",
  Finished = "finished",
}

export class RoomModel {
  constructor(
    public name: string,
    public state: RoomStatus,
    public players: PlayerModel[],
    public game: Game | null,
  ) {}

  static create(roomCreate: RoomCreateDto): RoomModel {
    return new RoomModel(roomCreate.name, RoomStatus.Open, [], null);
  }

  // only for client side
  static fromJSON(json: any): RoomModel {
    return new RoomModel(
      json.name,
      json.state,
      json.players.map((player: any) => PlayerModel.fromJSON(player)),
      json.game ? Game.fromJSON(json.game) : null,
    );
  }

  toJSON(): any {
    return {
      name: this.name,
      state: this.state,
      players: this.players,
      game: this.game?.toJSON() ?? null,
    };
  }

  findPlayer(userName: string): PlayerModel | undefined {
    return this.players.find((player) => player.userName === userName);
  }

  findPlayerByPosition(position: Position): PlayerModel | undefined {
    return this.players.find((player) => player.position === position);
  }
}
