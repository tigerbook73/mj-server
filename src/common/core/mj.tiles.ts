/**
 * id is the unique identifier for the tile
 * id is also the index of the tile in the allTiles array
 * id = 999 is the unknown tile
 * id = others (e.g -1) are empty tiles (no tiles)
 */

import { TileId, TileType } from "./mj.interface";

export class TileCore {
  constructor(
    public id: TileId,
    public type: TileType,
    public index: number,
    public name: string,
  ) {}

  isWan() {
    return this.type === TileType.WAN;
  }

  isTong() {
    return this.type === TileType.TONG;
  }

  isTiao() {
    return this.type === TileType.TIAO;
  }

  isJian() {
    return this.type === TileType.JIAN;
  }

  isOne() {
    return this.index === 1;
  }

  isNine() {
    return this.index === 9;
  }
}

// 未知牌，用于表示未知牌
export const unknownTileId = 999;
export const unknownTile = new TileCore(unknownTileId, TileType.KONG, 0, "空");

// void牌，表示没有牌
export const voidTileId = -1;
export const voidTile = new TileCore(voidTileId, TileType.KONG, 0, "空");

export const allTiles = [
  new TileCore(0, TileType.WAN, 1, "一万"),
  new TileCore(1, TileType.WAN, 1, "一万"),
  new TileCore(2, TileType.WAN, 1, "一万"),
  new TileCore(3, TileType.WAN, 1, "一万"),
  new TileCore(4, TileType.WAN, 2, "二万"),
  new TileCore(5, TileType.WAN, 2, "二万"),
  new TileCore(6, TileType.WAN, 2, "二万"),
  new TileCore(7, TileType.WAN, 2, "二万"),
  new TileCore(8, TileType.WAN, 3, "三万"),
  new TileCore(9, TileType.WAN, 3, "三万"),
  new TileCore(10, TileType.WAN, 3, "三万"),
  new TileCore(11, TileType.WAN, 3, "三万"),
  new TileCore(12, TileType.WAN, 4, "四万"),
  new TileCore(13, TileType.WAN, 4, "四万"),
  new TileCore(14, TileType.WAN, 4, "四万"),
  new TileCore(15, TileType.WAN, 4, "四万"),
  new TileCore(16, TileType.WAN, 5, "五万"),
  new TileCore(17, TileType.WAN, 5, "五万"),
  new TileCore(18, TileType.WAN, 5, "五万"),
  new TileCore(19, TileType.WAN, 5, "五万"),
  new TileCore(20, TileType.WAN, 6, "六万"),
  new TileCore(21, TileType.WAN, 6, "六万"),
  new TileCore(22, TileType.WAN, 6, "六万"),
  new TileCore(23, TileType.WAN, 6, "六万"),
  new TileCore(24, TileType.WAN, 7, "七万"),
  new TileCore(25, TileType.WAN, 7, "七万"),
  new TileCore(26, TileType.WAN, 7, "七万"),
  new TileCore(27, TileType.WAN, 7, "七万"),
  new TileCore(28, TileType.WAN, 8, "八万"),
  new TileCore(29, TileType.WAN, 8, "八万"),
  new TileCore(30, TileType.WAN, 8, "八万"),
  new TileCore(31, TileType.WAN, 8, "八万"),
  new TileCore(32, TileType.WAN, 9, "九万"),
  new TileCore(33, TileType.WAN, 9, "九万"),
  new TileCore(34, TileType.WAN, 9, "九万"),
  new TileCore(35, TileType.WAN, 9, "九万"),
  new TileCore(36, TileType.TONG, 1, "一筒"),
  new TileCore(37, TileType.TONG, 1, "一筒"),
  new TileCore(38, TileType.TONG, 1, "一筒"),
  new TileCore(39, TileType.TONG, 1, "一筒"),
  new TileCore(40, TileType.TONG, 2, "二筒"),
  new TileCore(41, TileType.TONG, 2, "二筒"),
  new TileCore(42, TileType.TONG, 2, "二筒"),
  new TileCore(43, TileType.TONG, 2, "二筒"),
  new TileCore(44, TileType.TONG, 3, "三筒"),
  new TileCore(45, TileType.TONG, 3, "三筒"),
  new TileCore(46, TileType.TONG, 3, "三筒"),
  new TileCore(47, TileType.TONG, 3, "三筒"),
  new TileCore(48, TileType.TONG, 4, "四筒"),
  new TileCore(49, TileType.TONG, 4, "四筒"),
  new TileCore(50, TileType.TONG, 4, "四筒"),
  new TileCore(51, TileType.TONG, 4, "四筒"),
  new TileCore(52, TileType.TONG, 5, "五筒"),
  new TileCore(53, TileType.TONG, 5, "五筒"),
  new TileCore(54, TileType.TONG, 5, "五筒"),
  new TileCore(55, TileType.TONG, 5, "五筒"),
  new TileCore(56, TileType.TONG, 6, "六筒"),
  new TileCore(57, TileType.TONG, 6, "六筒"),
  new TileCore(58, TileType.TONG, 6, "六筒"),
  new TileCore(59, TileType.TONG, 6, "六筒"),
  new TileCore(60, TileType.TONG, 7, "七筒"),
  new TileCore(61, TileType.TONG, 7, "七筒"),
  new TileCore(62, TileType.TONG, 7, "七筒"),
  new TileCore(63, TileType.TONG, 7, "七筒"),
  new TileCore(64, TileType.TONG, 8, "八筒"),
  new TileCore(65, TileType.TONG, 8, "八筒"),
  new TileCore(66, TileType.TONG, 8, "八筒"),
  new TileCore(67, TileType.TONG, 8, "八筒"),
  new TileCore(68, TileType.TONG, 9, "九筒"),
  new TileCore(69, TileType.TONG, 9, "九筒"),
  new TileCore(70, TileType.TONG, 9, "九筒"),
  new TileCore(71, TileType.TONG, 9, "九筒"),
  new TileCore(72, TileType.TIAO, 1, "一条"),
  new TileCore(73, TileType.TIAO, 1, "一条"),
  new TileCore(74, TileType.TIAO, 1, "一条"),
  new TileCore(75, TileType.TIAO, 1, "一条"),
  new TileCore(76, TileType.TIAO, 2, "二条"),
  new TileCore(77, TileType.TIAO, 2, "二条"),
  new TileCore(78, TileType.TIAO, 2, "二条"),
  new TileCore(79, TileType.TIAO, 2, "二条"),
  new TileCore(80, TileType.TIAO, 3, "三条"),
  new TileCore(81, TileType.TIAO, 3, "三条"),
  new TileCore(82, TileType.TIAO, 3, "三条"),
  new TileCore(83, TileType.TIAO, 3, "三条"),
  new TileCore(84, TileType.TIAO, 4, "四条"),
  new TileCore(85, TileType.TIAO, 4, "四条"),
  new TileCore(86, TileType.TIAO, 4, "四条"),
  new TileCore(87, TileType.TIAO, 4, "四条"),
  new TileCore(88, TileType.TIAO, 5, "五条"),
  new TileCore(89, TileType.TIAO, 5, "五条"),
  new TileCore(90, TileType.TIAO, 5, "五条"),
  new TileCore(91, TileType.TIAO, 5, "五条"),
  new TileCore(92, TileType.TIAO, 6, "六条"),
  new TileCore(93, TileType.TIAO, 6, "六条"),
  new TileCore(94, TileType.TIAO, 6, "六条"),
  new TileCore(95, TileType.TIAO, 6, "六条"),
  new TileCore(96, TileType.TIAO, 7, "七条"),
  new TileCore(97, TileType.TIAO, 7, "七条"),
  new TileCore(98, TileType.TIAO, 7, "七条"),
  new TileCore(99, TileType.TIAO, 7, "七条"),
  new TileCore(100, TileType.TIAO, 8, "八条"),
  new TileCore(101, TileType.TIAO, 8, "八条"),
  new TileCore(102, TileType.TIAO, 8, "八条"),
  new TileCore(103, TileType.TIAO, 8, "八条"),
  new TileCore(104, TileType.TIAO, 9, "九条"),
  new TileCore(105, TileType.TIAO, 9, "九条"),
  new TileCore(106, TileType.TIAO, 9, "九条"),
  new TileCore(107, TileType.TIAO, 9, "九条"),
  new TileCore(108, TileType.JIAN, 1, "东"),
  new TileCore(109, TileType.JIAN, 1, "东"),
  new TileCore(110, TileType.JIAN, 1, "东"),
  new TileCore(111, TileType.JIAN, 1, "东"),
  new TileCore(112, TileType.JIAN, 2, "南"),
  new TileCore(113, TileType.JIAN, 2, "南"),
  new TileCore(114, TileType.JIAN, 2, "南"),
  new TileCore(115, TileType.JIAN, 2, "南"),
  new TileCore(116, TileType.JIAN, 3, "西"),
  new TileCore(117, TileType.JIAN, 3, "西"),
  new TileCore(118, TileType.JIAN, 3, "西"),
  new TileCore(119, TileType.JIAN, 3, "西"),
  new TileCore(120, TileType.JIAN, 4, "北"),
  new TileCore(121, TileType.JIAN, 4, "北"),
  new TileCore(122, TileType.JIAN, 4, "北"),
  new TileCore(123, TileType.JIAN, 4, "北"),
  new TileCore(124, TileType.JIAN, 5, "中"),
  new TileCore(125, TileType.JIAN, 5, "中"),
  new TileCore(126, TileType.JIAN, 5, "中"),
  new TileCore(127, TileType.JIAN, 5, "中"),
  new TileCore(128, TileType.JIAN, 6, "发"),
  new TileCore(129, TileType.JIAN, 6, "发"),
  new TileCore(130, TileType.JIAN, 6, "发"),
  new TileCore(131, TileType.JIAN, 6, "发"),
  new TileCore(132, TileType.JIAN, 7, "白"),
  new TileCore(133, TileType.JIAN, 7, "白"),
  new TileCore(134, TileType.JIAN, 7, "白"),
  new TileCore(135, TileType.JIAN, 7, "白"),
  // new TileCore( 136, TileType.HUA, 1, "春" ),
  // new TileCore( 137, TileType.HUA, 2, "夏" ),
  // new TileCore( 138, TileType.HUA, 3, "秋" ),
  // new TileCore( 139, TileType.HUA, 4, "东" ),
  // new TileCore( 140, TileType.HUA, 5, "梅" ),
  // new TileCore( 141, TileType.HUA, 6, "兰" ),
  // new TileCore( 142, TileType.HUA, 7, "竹" ),
  // new TileCore( 143, TileType.HUA, 8, "菊" ),
];

export function tileFromId(id: TileId) {
  if (id === unknownTileId) {
    return unknownTile;
  }
  if (id === voidTileId) {
    return voidTile;
  }
  return allTiles.find((tile) => tile.id === id) || unknownTile;
}

export function isIdenticalTiles(
  tile1: TileCore | TileId,
  tile2: TileCore | TileId,
) {
  return (
    (typeof tile1 === "number" ? tile1 : tile1.id) ===
    (typeof tile2 === "number" ? tile2 : tile2.id)
  );
}

export function isSameTiles(
  tile1: TileCore | TileId,
  tile2: TileCore | TileId,
  tile3: TileCore | TileId = voidTileId,
  tile4: TileCore | TileId = voidTileId,
) {
  const t1 = tile1 instanceof TileCore ? tile1 : tileFromId(tile1);
  const t2 = tile2 instanceof TileCore ? tile2 : tileFromId(tile2);
  const t3 = tile3 instanceof TileCore ? tile3 : tileFromId(tile3);
  const t4 = tile4 instanceof TileCore ? tile4 : tileFromId(tile4);

  if (t1.name !== t2.name) {
    return false;
  }

  if (t3 && t1.name !== t3.name) {
    return false;
  }

  if (t4 && t1.name !== t4.name) {
    return false;
  }

  return true;
}

export function isConsecutiveTiles(
  tile1: TileCore | TileId,
  tile2: TileCore | TileId,
  tile3: TileCore | TileId = voidTileId,
) {
  const tiles = [];
  tiles.push(tile1 instanceof TileCore ? tile1 : tileFromId(tile1));
  tiles.push(tile2 instanceof TileCore ? tile2 : tileFromId(tile2));
  if (tile3 !== voidTileId) {
    tiles.push(tile3 instanceof TileCore ? tile3 : tileFromId(tile3));
  }

  if (!tiles[0].isWan() || !tiles[0].isTong() || !tiles[0].isTiao()) {
    return false;
  }

  tiles.sort((a, b) => a.index - b.index);

  for (let i = 0; i < tiles.length - 1; i++) {
    if (
      tiles[i].type !== tiles[i + 1].type ||
      tiles[i].index + 1 !== tiles[i + 1].index
    ) {
      return false;
    }
  }

  return true;
}

export function sortTiles(tiles: (TileCore | TileId)[]) {
  if (tiles.length == 0) {
    return tiles;
  }
  return tiles.sort(
    (a, b) =>
      (typeof a == "number" ? a : a.id) - (typeof b == "number" ? b : b.id),
  );
}

export const MjCore = {
  TileCore,
  allTiles,
  unknownTileId,
  unknownTile,
  voidTileId,
  voidTile,
  tileFromId,
  isIdenticalTiles,
  isSameTiles,
  isConsecutiveTiles,
  sortTiles,
};
