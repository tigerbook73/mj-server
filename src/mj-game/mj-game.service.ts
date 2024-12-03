import { Injectable } from "@nestjs/common";
import { MjGameModel } from "src/common/models/mj.game.model";
import { PlayerModel } from "src/common/models/player.model";
import { RoomModel } from "src/common/models/room.model";
// import { Socket } from "socket.io-client";
// import { GameRequest, GameResponse } from "src/common/protocols/apis.models";

@Injectable()
export class MjGameService {
  games: MjGameModel[]; // TODO: more attributes required

  constructor() {
    //
  }

  startGame(room: RoomModel): MjGameModel {
    const game = new MjGameModel(room);
    this.games.push(game);
    game.startGame();
    return game;
  }

  stopGame(game: MjGameModel): void {
    //
    void game;
  }

  endGame(game: MjGameModel): void {
    //
    void game;
  }

  /**
   * active game operation
   */
  pickTile(game: MjGameModel, player: PlayerModel): void {
    //
    void game;
    void player;
  }

  discardTile(game: MjGameModel, player: PlayerModel, tile: any): void {
    //
    void game;
    void player;
    void tile;
  }

  pengTile(game: MjGameModel, player: PlayerModel, tiles: any[2]): void {
    //
    void game;
    void player;
    void tiles;
  }

  chiTile(game: MjGameModel, player: PlayerModel, tiles: any[2]): void {
    //
    void game;
    void player;
    void tiles;
  }

  gangTile(game: MjGameModel, player: PlayerModel, tiles: any[3]): void {
    //
    void game;
    void player;
    void tiles;
  }

  /**
   * did not peng/chi/gang
   */
  passAction(game: MjGameModel, player: PlayerModel): void {
    //
    void game;
    void player;
  }

  fangChong(game: MjGameModel, player: PlayerModel, tiles: any[]): void {
    //
    void game;
    void player;
    void tiles;
  }

  huGame(game: MjGameModel, player: PlayerModel): void {
    //
    void game;
    void player;
  }
}
