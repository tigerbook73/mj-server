import { Game, Position } from "./mj.game";
import { TileId } from "./mj.tile-core";

describe("Game serialization", () => {
  it("should serialize and deserialize the game state correctly", () => {
    const game = new Game();
    game.init([Position.East, Position.South, Position.West, Position.North]);

    let json = game.toJSON();
    let newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);

    game.start();
    json = game.toJSON();
    newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);

    game.drop(game.current?.handTiles[0] as TileId);
    json = game.toJSON();
    newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);

    game.pass(game.getNextPlayer(game.current));
    json = game.toJSON();
    newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);

    game.pass(game.getNextPlayer(game.getNextPlayer(game.current)));
    json = game.toJSON();
    newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);

    game.pass(
      game.getNextPlayer(game.getNextPlayer(game.getNextPlayer(game.current))),
    );
    json = game.toJSON();
    newGame = Game.fromJSON(json);
    expect(newGame).toEqual(game);
    expect(newGame.toJSON()).toEqual(json);
  });
});
