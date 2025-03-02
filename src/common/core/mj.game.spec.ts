import { Game, Player, Position, GameState } from "./mj.game";
import { TileCore } from "./mj.tile-core";

describe("Game Play", () => {
  let game: Game;
  let current: Player;

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
    game.discard(current.picked);
    expect(game.state).toBe(GameState.WaitingPass);
  });

  it("pass(all)", () => {
    const nextPlayer = game.getNextPlayer();
    game.pass(nextPlayer);
    expect(game.state).toBe(GameState.WaitingAction);
    expect(game.current).toBe(nextPlayer);
  });

  it("discard(0)", () => {
    game.discard(current.handTiles[0]);
    expect(game.state).toBe(GameState.WaitingPass);
  });
});
