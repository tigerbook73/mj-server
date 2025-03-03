import { Injectable } from "@nestjs/common";
import { Game, Player } from "src/common/core/mj.game";
import { TileId } from "src/common/core/mj.tile-core";

@Injectable()
export class GameService {
  constructor() {
    //
  }

  startGame(player: Player, game: Game): Game {
    // player is in current game
    if (!game.players.includes(player)) {
      throw new Error("Player is not in current game");
    }

    game.start();
    return game;
  }

  resetGame(player: Player, game: Game): Game {
    // player is in current game
    if (!game.players.includes(player)) {
      throw new Error("Player is not in current game");
    }
    const positions = game.players.map((player) => player.position);
    game.init(positions);
    return game;
  }

  actionDrop(player: Player, game: Game, tileId: TileId): Game {
    // player is the current player
    if (game.current !== player) {
      throw new Error("Player is not the current player");
    }

    game.drop(tileId);
    return game;
  }

  actionAnGang(
    player: Player,
    game: Game,
    tileIds: [TileId, TileId, TileId, TileId],
  ): Game {
    // player is the current player
    if (game.current !== player) {
      throw new Error("Player is not the current player");
    }

    game.angang(tileIds);
    return game;
  }

  actionHuzimo(player: Player, game: Game): Game {
    // player is the current player
    if (game.current !== player) {
      throw new Error("Player is not the current player");
    }

    game.huZhimo();
    return game;
  }

  actionPass(player: Player, game: Game): Game {
    // player is in current game and not the current player
    if (player === game.current || !game.players.includes(player)) {
      throw new Error("Player is not in current game or is the current player");
    }

    game.pass(player);
    return game;
  }

  actionChi(player: Player, game: Game, tileIds: [TileId, TileId]): Game {
    // player is the next player of the current player
    if (game.getNextPlayer() !== player) {
      throw new Error("Player is not the next player of the current player");
    }

    game.chi(tileIds);
    return game;
  }

  actionPeng(player: Player, game: Game, tileIds: [TileId, TileId]): Game {
    // player is not the current and in current game
    if (player === game.current || !game.players.includes(player)) {
      throw new Error("Player is the current player or not in current game");
    }

    game.peng(tileIds);
    return game;
  }

  actionGong(
    player: Player,
    game: Game,
    tileIds: [TileId, TileId, TileId],
  ): Game {
    // player is not the current and in current game
    if (player === game.current || !game.players.includes(player)) {
      throw new Error("Player is the current player or not in current game");
    }

    game.gang(tileIds);
    return game;
  }

  actionHu(player: Player, game: Game): Game {
    game.hu(player);
    return game;
  }
}
