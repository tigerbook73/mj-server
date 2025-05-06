import { Injectable } from "@nestjs/common";
import { ActionResult, Game, GameState, Player } from "src/common/core/mj.game";
import { type TileId } from "src/common/core/mj.tile-core";
import { UserType } from "src/common/models/common.types";
import { RoomModel } from "src/common/models/room.model";

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
    const positions = game.players
      .filter((player) => player)
      .map((player) => (player as Player).position);
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

  actionAngang(
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

  actionZimo(player: Player, game: Game): Game {
    // player is the current player
    if (game.current !== player) {
      throw new Error("Player is not the current player");
    }

    game.zimo();
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

    game.peng(player, tileIds);
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

    game.gang(player, tileIds);
    return game;
  }

  actionHu(player: Player, game: Game): Game {
    game.hu(player);
    return game;
  }

  autoPlayOneStep(room: RoomModel): boolean {
    const game = room.game;
    if (!game) {
      return false;
    }

    if (
      game.state !== GameState.WaitingAction &&
      game.state !== GameState.WaitingPass
    ) {
      return false;
    }

    // find the current player
    const currentPlayer = game.current;
    if (!currentPlayer) {
      throw new Error("Current player not found");
    }
    const currentPlayerModel = room.findPlayerByPosition(
      currentPlayer.position,
    );
    if (!currentPlayerModel) {
      throw new Error("Current player model not found");
    }

    /**
     * if state === GameState.WaitingAction && current player is robot, drop one tile
     */
    if (
      game.state === GameState.WaitingAction &&
      currentPlayerModel.type === UserType.Bot
    ) {
      const tiles = [...currentPlayer.handTiles, currentPlayer.picked].sort(
        (a, b) => a - b,
      );
      game.drop(tiles[tiles.length - 1]);
      return true;
    }

    /**
     * if state === GameState.WaitingPass, if the next queued player is robot, pass
     */
    if (game.state === GameState.WaitingPass) {
      const firstWatingAction = game.queuedActions.find(
        (action) => action.status == ActionResult.Waiting,
      );
      if (!firstWatingAction) {
        return false;
      }

      const firstWaitingPlayer = firstWatingAction.player;
      const firstWaitingPlayerModel = room.findPlayerByPosition(
        firstWaitingPlayer.position,
      );
      if (!firstWaitingPlayerModel) {
        throw new Error("First waiting player model not found");
      }
      if (firstWaitingPlayerModel.type === UserType.Bot) {
        game.pass(firstWaitingPlayer);
        return true;
      }
    }
    return false;
  }
}
