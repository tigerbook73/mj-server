import { Injectable } from "@nestjs/common";
import { Game, Player } from "src/common/core/mj.game";
import { TileId } from "src/common/core/mj.tile-core";

@Injectable()
export class GameService {
  constructor() {
    //
  }

  startGame(game: Game): Game {
    game.start();
    return game;
  }

  resetGame(game: Game): Game {
    const positions = game.players.map((player) => player.position);
    game.init(positions);
    return game;
  }

  actionDropTile(game: Game, player: Player, tileId: TileId): Game {
    game.discard(player, tileId);
    return game;
  }

  actionPass(game: Game, player: Player): Game {
    game.pass(player);
    return game;
  }

  actionChi(game: Game, player: Player, tileIds: [TileId, TileId]): Game {
    game.chi(player, tileIds);
    return game;
  }

  actionPeng(game: Game, player: Player, tileIds: [TileId, TileId]): Game {
    game.peng(player, tileIds);
    return game;
  }

  actionGong(
    game: Game,
    player: Player,
    tileIds: [TileId, TileId, TileId],
  ): Game {
    game.gang(player, tileIds);
    return game;
  }

  actionHu(game: Game, player: Player): Game {
    game.hu(player);
    return game;
  }
}
