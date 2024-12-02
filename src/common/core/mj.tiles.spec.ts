import { sortTiles } from "./mj.tiles";

describe("Mj Tile", () => {
  test("sort tile test 1", () => {
    const tiles = [5, 6, 7, 8, 9, 1, 2, 3, 4];

    sortTiles(tiles);

    for (let i = 0; i < tiles.length - 1; i++) {
      expect(tiles[i]).toBeLessThan(tiles[i + 1]);
    }
  });
});
