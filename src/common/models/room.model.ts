import { PlayerModel } from "./player.model";

export class RoomModel {
  name: string;
  state: "open" | "started" | "finished";
  players: PlayerModel[];
}
