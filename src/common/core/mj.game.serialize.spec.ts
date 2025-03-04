import { Game, Position } from "./mj.game";

describe("Game serialization", () => {
  it("should serialize and deserialize the game state correctly", () => {
    const game = new Game();
    game.init([Position.East, Position.South, Position.West, Position.North]);

    let json = game.serialize();
    let newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);

    game.start();
    json = game.serialize();
    newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);

    game.drop(game.current.handTiles[0]);
    json = game.serialize();
    newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);

    game.pass(game.getNextPlayer(game.current));
    json = game.serialize();
    newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);

    game.pass(game.getNextPlayer(game.getNextPlayer(game.current)));
    json = game.serialize();
    newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);

    game.pass(
      game.getNextPlayer(game.getNextPlayer(game.getNextPlayer(game.current))),
    );
    json = game.serialize();
    newGame = Game.deserialize(json);
    expect(newGame).toEqual(game);
    expect(newGame.serialize()).toEqual(json);
  });
});
