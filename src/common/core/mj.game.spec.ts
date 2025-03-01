import { Game, Player, Position, GameState } from "./mj.game";
import { TileCore } from "./mj.tile-core";

describe("Game", () => {
  let game: Game;

  beforeAll(() => {
    game = new Game();
  });

  it("init() test", () => {
    game.init();

    expect(game.players.length).toBe(4);
    expect(game.walls.length).toBe(4);
    expect(game.discards.length).toBe(4);
    expect(game.state).toBe(GameState.Init);
    expect(game.latestTile).toBe(TileCore.voidId);
    expect(game.current).toBeNull();
    expect(game.dealer).toBeNull();
  });

  it("add player test", () => {
    const playerEast = new Player(Position.East);
    const playerWest = new Player(Position.West);

    game.setPlayer(playerEast);
    game.setPlayer(playerWest);
    expect(game.players[Position.East]).toBe(playerEast);
    expect(game.players[Position.West]).toBe(playerWest);
  });

  it("should assign a dealer correctly", () => {
    const playerEast = new Player(Position.East);
    const playerWest = new Player(Position.West);

    game.setPlayer(playerEast);
    game.setPlayer(playerWest);
    game.start();
    expect(game.dealer).not.toBeNull();
    expect(playerEast.handTiles.length).toBeGreaterThanOrEqual(13);
    expect(playerWest.handTiles.length).toBeGreaterThanOrEqual(13);
    expect(game.getDealer().picked).not.toBe(TileCore.voidId);
  });
});
