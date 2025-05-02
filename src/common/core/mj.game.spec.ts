import { Game, Position, GameState } from "./mj.game";
import { TileCore, type TileId } from "./mj.tile-core";

describe("Game Play", () => {
  let game: Game;

  beforeAll(() => {
    game = new Game();
  });

  it("init()", () => {
    game.init([Position.East, Position.West]);

    expect(game.players.length).toBe(4);
    expect(game.walls.length).toBe(4);
    expect(game.discards.length).toBe(4);
    expect(game.state).toBe(GameState.Init);
    expect(game.latestTile).toBe(TileCore.voidId);
    expect(game.current).toBeNull();
    expect(game.dealer).toBeNull();

    expect(game.players[Position.East]).toBeDefined();
    expect(game.players[Position.West]).toBeDefined();
  });

  it("start()", () => {
    game.start();
    expect(game.state).toBe(GameState.WaitingAction);
    expect(game.dealer).toBe(game.players[Position.East]);
    expect(game.current).toBe(game.dealer);
  });

  it("discard(picked)", () => {
    game.drop(game.current?.picked as TileId);
    expect(game.state).toBe(GameState.WaitingPass);
  });

  it("pass(all)", () => {
    const nextPlayer = game.getNextPlayer();
    game.pass(nextPlayer);
    expect(game.state).toBe(GameState.WaitingAction);
    expect(game.current).toBe(nextPlayer);
  });

  it("discard(0)", () => {
    game.drop(game.current?.handTiles[0] as TileId);
    expect(game.state).toBe(GameState.WaitingPass);
  });
});
