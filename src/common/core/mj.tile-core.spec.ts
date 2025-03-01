import { TileCore, TileType } from "./mj.tile-core";

describe("TileCore", () => {
  it("should create a tile with correct properties", () => {
    const tile = new TileCore(1, TileType.WAN, 1, "一万");
    expect(tile.id).toBe(1);
    expect(tile.type).toBe(TileType.WAN);
    expect(tile.index).toBe(1);
    expect(tile.name).toBe("一万");
  });

  it("should return unknown tile for unknown id", () => {
    const tile = TileCore.fromId(TileCore.unknownId);
    expect(tile).toBe(TileCore.unknownTile);
  });

  it("should return void tile for void id", () => {
    const tile = TileCore.fromId(TileCore.voidId);
    expect(tile).toBe(TileCore.voidTile);
  });

  it("should identify identical tiles", () => {
    const tile1 = TileCore.fromNameAndIndex("一万", 1);
    const tile2 = TileCore.fromNameAndIndex("一万", 1);
    expect(TileCore.isIdentical(tile1, tile2)).toBe(true);
  });

  it("should identify different tiles with same name", () => {
    const tile1 = TileCore.fromNameAndIndex("一万", 0);
    const tile2 = TileCore.fromNameAndIndex("一万", 1);
    expect(TileCore.isIdentical(tile1, tile2)).toBe(false);
  });

  it("should identify same tiles", () => {
    const tile1 = TileCore.fromNameAndIndex("一万", 1);
    const tile2 = TileCore.fromNameAndIndex("一万", 2);
    const tile3 = TileCore.fromNameAndIndex("一万", 3);
    expect(TileCore.isSame(tile1, tile2, tile3)).toBe(true);
  });

  it("should identify consecutive tiles", () => {
    const tile1 = TileCore.fromNameAndIndex("一万", 1);
    const tile2 = TileCore.fromNameAndIndex("二万", 2);
    const tile3 = TileCore.fromNameAndIndex("三万", 3);
    expect(TileCore.isConsecutive(tile1, tile2, tile3)).toBe(true);
  });

  it("should sort tiles by id", () => {
    const tile1 = TileCore.fromNameAndIndex("三万", 3);
    const tile2 = TileCore.fromNameAndIndex("一万", 1);
    const tile3 = TileCore.fromNameAndIndex("二万", 2);
    const sortedTiles = TileCore.sortTiles([tile1, tile2, tile3]);
    expect(sortedTiles[0]).toBe(tile2);
    expect(sortedTiles[1]).toBe(tile3);
    expect(sortedTiles[2]).toBe(tile1);
  });
});
