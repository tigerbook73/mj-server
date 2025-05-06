/**
 * common types
 */

export type TileId = number;

export const enum TileType {
  WAN = "万",
  TONG = "筒",
  TIAO = "条",
  JIAN = "箭",
  KONG = " ",
}

export class TileCore {
  /**
   * id 是牌的唯一标识(4个牌面相同的牌id是不同的)
   * id 也是 allTiles 数组中牌的索引
   * id = 999 是未知牌
   * id = 其他 (例如 -1) 是空牌 (没有牌)
   */
  constructor(
    public id: TileId, // unique identifier for the tile instance
    public type: TileType, // type of the tile
    public index: number, // index of the tile in the type
    public name: string, // name of the tile
    public nameIndex: number = 0, // index of the name
  ) {}

  static readonly unknownId = 999;
  static readonly unknownTile = new TileCore(
    TileCore.unknownId,
    TileType.KONG,
    0,
    "",
  );

  static readonly voidId = -1;
  static readonly voidTile = new TileCore(
    TileCore.voidId,
    TileType.KONG,
    0,
    "",
  );

  static readonly allTiles = [
    new TileCore(0, TileType.WAN, 1, "一万", 0),
    new TileCore(1, TileType.WAN, 1, "一万", 1),
    new TileCore(2, TileType.WAN, 1, "一万", 2),
    new TileCore(3, TileType.WAN, 1, "一万", 3),
    new TileCore(4, TileType.WAN, 2, "二万", 0),
    new TileCore(5, TileType.WAN, 2, "二万", 1),
    new TileCore(6, TileType.WAN, 2, "二万", 2),
    new TileCore(7, TileType.WAN, 2, "二万", 3),
    new TileCore(8, TileType.WAN, 3, "三万", 0),
    new TileCore(9, TileType.WAN, 3, "三万", 1),
    new TileCore(10, TileType.WAN, 3, "三万", 2),
    new TileCore(11, TileType.WAN, 3, "三万", 3),
    new TileCore(12, TileType.WAN, 4, "四万", 0),
    new TileCore(13, TileType.WAN, 4, "四万", 1),
    new TileCore(14, TileType.WAN, 4, "四万", 2),
    new TileCore(15, TileType.WAN, 4, "四万", 3),
    new TileCore(16, TileType.WAN, 5, "五万", 0),
    new TileCore(17, TileType.WAN, 5, "五万", 1),
    new TileCore(18, TileType.WAN, 5, "五万", 2),
    new TileCore(19, TileType.WAN, 5, "五万", 3),
    new TileCore(20, TileType.WAN, 6, "六万", 0),
    new TileCore(21, TileType.WAN, 6, "六万", 1),
    new TileCore(22, TileType.WAN, 6, "六万", 2),
    new TileCore(23, TileType.WAN, 6, "六万", 3),
    new TileCore(24, TileType.WAN, 7, "七万", 0),
    new TileCore(25, TileType.WAN, 7, "七万", 1),
    new TileCore(26, TileType.WAN, 7, "七万", 2),
    new TileCore(27, TileType.WAN, 7, "七万", 3),
    new TileCore(28, TileType.WAN, 8, "八万", 0),
    new TileCore(29, TileType.WAN, 8, "八万", 1),
    new TileCore(30, TileType.WAN, 8, "八万", 2),
    new TileCore(31, TileType.WAN, 8, "八万", 3),
    new TileCore(32, TileType.WAN, 9, "九万", 0),
    new TileCore(33, TileType.WAN, 9, "九万", 1),
    new TileCore(34, TileType.WAN, 9, "九万", 2),
    new TileCore(35, TileType.WAN, 9, "九万", 3),
    new TileCore(36, TileType.TONG, 1, "一筒", 0),
    new TileCore(37, TileType.TONG, 1, "一筒", 1),
    new TileCore(38, TileType.TONG, 1, "一筒", 2),
    new TileCore(39, TileType.TONG, 1, "一筒", 3),
    new TileCore(40, TileType.TONG, 2, "二筒", 0),
    new TileCore(41, TileType.TONG, 2, "二筒", 1),
    new TileCore(42, TileType.TONG, 2, "二筒", 2),
    new TileCore(43, TileType.TONG, 2, "二筒", 3),
    new TileCore(44, TileType.TONG, 3, "三筒", 0),
    new TileCore(45, TileType.TONG, 3, "三筒", 1),
    new TileCore(46, TileType.TONG, 3, "三筒", 2),
    new TileCore(47, TileType.TONG, 3, "三筒", 3),
    new TileCore(48, TileType.TONG, 4, "四筒", 0),
    new TileCore(49, TileType.TONG, 4, "四筒", 1),
    new TileCore(50, TileType.TONG, 4, "四筒", 2),
    new TileCore(51, TileType.TONG, 4, "四筒", 3),
    new TileCore(52, TileType.TONG, 5, "五筒", 0),
    new TileCore(53, TileType.TONG, 5, "五筒", 1),
    new TileCore(54, TileType.TONG, 5, "五筒", 2),
    new TileCore(55, TileType.TONG, 5, "五筒", 3),
    new TileCore(56, TileType.TONG, 6, "六筒", 0),
    new TileCore(57, TileType.TONG, 6, "六筒", 1),
    new TileCore(58, TileType.TONG, 6, "六筒", 2),
    new TileCore(59, TileType.TONG, 6, "六筒", 3),
    new TileCore(60, TileType.TONG, 7, "七筒", 0),
    new TileCore(61, TileType.TONG, 7, "七筒", 1),
    new TileCore(62, TileType.TONG, 7, "七筒", 2),
    new TileCore(63, TileType.TONG, 7, "七筒", 3),
    new TileCore(64, TileType.TONG, 8, "八筒", 0),
    new TileCore(65, TileType.TONG, 8, "八筒", 1),
    new TileCore(66, TileType.TONG, 8, "八筒", 2),
    new TileCore(67, TileType.TONG, 8, "八筒", 3),
    new TileCore(68, TileType.TONG, 9, "九筒", 0),
    new TileCore(69, TileType.TONG, 9, "九筒", 1),
    new TileCore(70, TileType.TONG, 9, "九筒", 2),
    new TileCore(71, TileType.TONG, 9, "九筒", 3),
    new TileCore(72, TileType.TIAO, 1, "一条", 0),
    new TileCore(73, TileType.TIAO, 1, "一条", 1),
    new TileCore(74, TileType.TIAO, 1, "一条", 2),
    new TileCore(75, TileType.TIAO, 1, "一条", 3),
    new TileCore(76, TileType.TIAO, 2, "二条", 0),
    new TileCore(77, TileType.TIAO, 2, "二条", 1),
    new TileCore(78, TileType.TIAO, 2, "二条", 2),
    new TileCore(79, TileType.TIAO, 2, "二条", 3),
    new TileCore(80, TileType.TIAO, 3, "三条", 0),
    new TileCore(81, TileType.TIAO, 3, "三条", 1),
    new TileCore(82, TileType.TIAO, 3, "三条", 2),
    new TileCore(83, TileType.TIAO, 3, "三条", 3),
    new TileCore(84, TileType.TIAO, 4, "四条", 0),
    new TileCore(85, TileType.TIAO, 4, "四条", 1),
    new TileCore(86, TileType.TIAO, 4, "四条", 2),
    new TileCore(87, TileType.TIAO, 4, "四条", 3),
    new TileCore(88, TileType.TIAO, 5, "五条", 0),
    new TileCore(89, TileType.TIAO, 5, "五条", 1),
    new TileCore(90, TileType.TIAO, 5, "五条", 2),
    new TileCore(91, TileType.TIAO, 5, "五条", 3),
    new TileCore(92, TileType.TIAO, 6, "六条", 0),
    new TileCore(93, TileType.TIAO, 6, "六条", 1),
    new TileCore(94, TileType.TIAO, 6, "六条", 2),
    new TileCore(95, TileType.TIAO, 6, "六条", 3),
    new TileCore(96, TileType.TIAO, 7, "七条", 0),
    new TileCore(97, TileType.TIAO, 7, "七条", 1),
    new TileCore(98, TileType.TIAO, 7, "七条", 2),
    new TileCore(99, TileType.TIAO, 7, "七条", 3),
    new TileCore(100, TileType.TIAO, 8, "八条", 0),
    new TileCore(101, TileType.TIAO, 8, "八条", 1),
    new TileCore(102, TileType.TIAO, 8, "八条", 2),
    new TileCore(103, TileType.TIAO, 8, "八条", 3),
    new TileCore(104, TileType.TIAO, 9, "九条", 0),
    new TileCore(105, TileType.TIAO, 9, "九条", 1),
    new TileCore(106, TileType.TIAO, 9, "九条", 2),
    new TileCore(107, TileType.TIAO, 9, "九条", 3),
    new TileCore(108, TileType.JIAN, 1, "东", 0),
    new TileCore(109, TileType.JIAN, 1, "东", 1),
    new TileCore(110, TileType.JIAN, 1, "东", 2),
    new TileCore(111, TileType.JIAN, 1, "东", 3),
    new TileCore(112, TileType.JIAN, 2, "南", 0),
    new TileCore(113, TileType.JIAN, 2, "南", 1),
    new TileCore(114, TileType.JIAN, 2, "南", 2),
    new TileCore(115, TileType.JIAN, 2, "南", 3),
    new TileCore(116, TileType.JIAN, 3, "西", 0),
    new TileCore(117, TileType.JIAN, 3, "西", 1),
    new TileCore(118, TileType.JIAN, 3, "西", 2),
    new TileCore(119, TileType.JIAN, 3, "西", 3),
    new TileCore(120, TileType.JIAN, 4, "北", 0),
    new TileCore(121, TileType.JIAN, 4, "北", 1),
    new TileCore(122, TileType.JIAN, 4, "北", 2),
    new TileCore(123, TileType.JIAN, 4, "北", 3),
    new TileCore(124, TileType.JIAN, 5, "中", 0),
    new TileCore(125, TileType.JIAN, 5, "中", 1),
    new TileCore(126, TileType.JIAN, 5, "中", 2),
    new TileCore(127, TileType.JIAN, 5, "中", 3),
    new TileCore(128, TileType.JIAN, 6, "发", 0),
    new TileCore(129, TileType.JIAN, 6, "发", 1),
    new TileCore(130, TileType.JIAN, 6, "发", 2),
    new TileCore(131, TileType.JIAN, 6, "发", 3),
    new TileCore(132, TileType.JIAN, 7, "白", 0),
    new TileCore(133, TileType.JIAN, 7, "白", 1),
    new TileCore(134, TileType.JIAN, 7, "白", 2),
    new TileCore(135, TileType.JIAN, 7, "白", 3),
    // new TileCore( 136, TileType.HUA, 1, "春" ),
    // new TileCore( 137, TileType.HUA, 2, "夏" ),
    // new TileCore( 138, TileType.HUA, 3, "秋" ),
    // new TileCore( 139, TileType.HUA, 4, "东" ),
    // new TileCore( 140, TileType.HUA, 5, "梅" ),
    // new TileCore( 141, TileType.HUA, 6, "兰" ),
    // new TileCore( 142, TileType.HUA, 7, "竹" ),
    // new TileCore( 143, TileType.HUA, 8, "菊" ),
  ];

  static fromId(id: TileId) {
    if (id === TileCore.unknownId) {
      return TileCore.unknownTile;
    }
    if (id === TileCore.voidId) {
      return TileCore.voidTile;
    }
    return (
      TileCore.allTiles.find((tile) => tile.id === id) || TileCore.unknownTile
    );
  }

  static fromNameAndIndex(name: string, index: number) {
    return (
      TileCore.allTiles.find(
        (tile) => tile.name === name && tile.nameIndex === index,
      ) || TileCore.unknownTile
    );
  }

  static isIdentical(tile1: TileCore | TileId, tile2: TileCore | TileId) {
    return (
      (typeof tile1 === "number" ? tile1 : tile1.id) ===
      (typeof tile2 === "number" ? tile2 : tile2.id)
    );
  }

  static isSame(
    tile1: TileCore | TileId,
    tile2: TileCore | TileId,
    tile3: TileCore | TileId = TileCore.voidId,
    tile4: TileCore | TileId = TileCore.voidId,
  ) {
    const t1 = tile1 instanceof TileCore ? tile1 : TileCore.fromId(tile1);
    const t2 = tile2 instanceof TileCore ? tile2 : TileCore.fromId(tile2);
    const t3 = tile3 instanceof TileCore ? tile3 : TileCore.fromId(tile3);
    const t4 = tile4 instanceof TileCore ? tile4 : TileCore.fromId(tile4);

    if (t1.name !== t2.name) {
      return false;
    }

    if (t3.id !== TileCore.voidId && t1.name !== t3.name) {
      return false;
    }

    if (t4.id !== TileCore.voidId && t1.name !== t4.name) {
      return false;
    }

    return true;
  }

  static isConsecutive(
    tile1: TileCore | TileId,
    tile2: TileCore | TileId,
    tile3: TileCore | TileId = TileCore.voidId,
  ) {
    const tiles: TileCore[] = [];
    tiles.push(tile1 instanceof TileCore ? tile1 : TileCore.fromId(tile1));
    tiles.push(tile2 instanceof TileCore ? tile2 : TileCore.fromId(tile2));
    if (tile3 !== TileCore.voidId) {
      tiles.push(tile3 instanceof TileCore ? tile3 : TileCore.fromId(tile3));
    }

    if (!tiles[0].isWan() && !tiles[0].isTong() && !tiles[0].isTiao()) {
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

  static sortTiles(tiles: (TileCore | TileId)[]) {
    if (tiles.length == 0) {
      return tiles;
    }
    return tiles.sort(
      (a, b) =>
        (typeof a == "number" ? a : a.id) - (typeof b == "number" ? b : b.id),
    );
  }

  static canHu(handTiles: readonly TileId[], tile = TileCore.voidId) {
    const tiles = handTiles.slice();
    if (tile !== TileCore.voidId) {
      tiles.push(tile);
    }

    // sort tiles
    TileCore.sortTiles(tiles);

    for (let i = 0; i < tiles.length - 1; i++) {
      // try all pairs from start
      if (!TileCore.isSame(tiles[i], tiles[i + 1])) {
        continue;
      }
      const rest = tiles.slice();
      const result: Array<[TileId, TileId] | [TileId, TileId, TileId]> = [
        rest.splice(i, 2) as [TileId, TileId],
      ];

      while (rest.length >= 3) {
        // try the same 3 tiles
        if (TileCore.isSame(rest[0], rest[1], rest[2])) {
          result.push([rest[0], rest[1], rest[2]]);
          rest.splice(0, 3);
          continue;
        }

        // try the consecutive 3 tiles
        const t1 = 0;
        const t2 = rest.findIndex((tile) =>
          TileCore.isConsecutive(rest[t1], tile),
        );
        if (t2 < 0) {
          break; // no consecutive tiles
        }
        const t3 = rest.findIndex((tile) =>
          TileCore.isConsecutive(rest[t1], rest[t2], tile),
        );
        if (t3 < 0) {
          break; // no consecutive tiles
        }

        result.push([rest[t1], rest[t2], rest[t3]]);
        rest.splice(t3, 1);
        rest.splice(t2, 1);
        rest.splice(t1, 1);
      }

      if (rest.length === 0) {
        return true;
      }
    }

    return false;
  }

  static canPeng(handTiles: readonly TileId[], target: TileId): boolean {
    return handTiles.filter((t) => TileCore.isSame(t, target)).length >= 2;
  }

  static canGang(handTiles: readonly TileId[], target: TileId): boolean {
    return handTiles.filter((t) => TileCore.isSame(t, target)).length >= 3;
  }

  static canChi(handTiles: readonly TileId[], target: TileId): boolean {
    const filteredTiles = []; // tiles list that does not contain the latest tile and duplicate tiles
    let previousTile = TileCore.voidId;
    for (const tile of handTiles) {
      if (
        !TileCore.isSame(tile, target) &&
        !TileCore.isSame(tile, previousTile)
      ) {
        filteredTiles.push(tile);
      }
      previousTile = tile;
    }

    for (let i = 0; i < filteredTiles.length - 1; i++) {
      if (
        TileCore.isConsecutive(filteredTiles[i], filteredTiles[i + 1], target)
      ) {
        return true;
      }
    }
    return false;
  }

  isWan() {
    return this.type === TileType.WAN;
  }

  isTong() {
    return this.type === TileType.TONG;
  }

  isTiao() {
    return this.type === TileType.TIAO;
  }
}
