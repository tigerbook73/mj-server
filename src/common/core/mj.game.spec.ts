import { Game, Player, Position, GameState } from "./mj.game";
import { TileCore } from "./mj.tile-core";

describe("Game Play", () => {
  let game: Game;
  const playerEast = new Player(Position.East);
  const playerWest = new Player(Position.West);
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

    expect(game.players[Position.East]).toBe(playerEast);
    expect(game.players[Position.West]).toBe(playerWest);
  });

  it("start()", () => {
    game.start();
    expect(game.state).toBe(GameState.WaitingAction);
    expect(game.dealer).toBe(playerEast);
    expect(game.current).toBe(game.dealer);

    current = game.current;
  });

  it("discard(picked)", () => {
    game.discard(current, current.picked);
    expect(game.state).toBe(GameState.WaitingPass);
  });

  it("pass(east)", () => {
    game.pass(playerEast);
    expect(game.state).toBe(GameState.WaitingPass);
  });

  it("pass(west)", () => {
    game.pass(playerWest);
    expect(game.state).toBe(GameState.WaitingAction);
    expect(game.current).toBe(playerWest);
    current = game.current;
  });

  it("discard(0)", () => {
    game.discard(current, current.handTiles[0]);
    expect(game.state).toBe(GameState.WaitingPass);
  });
});
