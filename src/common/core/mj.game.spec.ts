import { Game, Player, Position } from "./mj.game";

describe("MjGame", () => {
  let myGame: Game;

  beforeEach(() => {
    myGame = new Game();
  });

  test("MjGame.init(1)", () => {
    myGame.init();
    myGame.setPlayer(new Player(Position.East));
    myGame.shuffle();
    myGame.assignDealer();
    myGame.dice();
    myGame.dispatch();

    expect(myGame.players[Position.East]).toBeDefined();
    expect(myGame.walls[Position.East].tiles.length).toBeGreaterThan(0);
    expect(myGame.walls[Position.South].tiles.length).toBeGreaterThan(0);
    expect(myGame.walls[Position.West].tiles.length).toBeGreaterThan(0);
    expect(myGame.walls[Position.North].tiles.length).toBeGreaterThan(0);
  });
});
