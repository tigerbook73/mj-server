import { type TileId, TileCore } from "./mj.tile-core";

/**
 * 动作类型
 */
export enum ActionType {
  Peng = "peng",
  Chi = "chi",
  Gang = "gang",
  Hu = "hu",
}

/**
 * 玩家的位置
 */
export enum Position {
  East = 0,
  South = 1,
  West = 2,
  North = 3,
}

/**
 * 用于表示已经碰，吃，杠的牌
 */
export class OpenedSet {
  constructor(
    public tiles: TileId[],
    public target: TileId,
    public actionType: ActionType,
    public from: Position,
  ) {}
}

/**
 * 玩家
 */
export class Player {
  constructor(
    public position: Position, // 玩家的位置
    public handTiles: TileId[] = [], // 玩家手里的牌，不包含已经碰，吃，杠的牌
    public picked: TileId = TileCore.voidTileId, // 玩家最后一次摸的牌
    public openedSets: OpenedSet[] = [], // 玩家已经碰，吃，杠的牌
  ) {}
}

/**
 * 游戏状态
 */
export enum GameState {
  Init = "init", // 初始化
  Dispatching = "dispatching", // 发牌中，后续可以拆分成更小的状态
  WaitingCurrent = "wating_current", // 等待玩家操作: 胡/暗杠/打牌
  WaitingAction = "waiting-action", // 等待玩家操作: 碰/杠/吃/过
  WaitingPick = "waiting-pick", // 等待玩家操作: 摸牌
  End = "end", // 游戏结束
}

/**
 *
 */
export class Wall {
  constructor(
    public position: Position = Position.East,
    public tiles: TileId[] = [],
  ) {
    //
  }
}

export class Discard {
  constructor(
    public position: Position = Position.East,
    public tiles: TileId[] = [],
  ) {
    //
  }
}

export class Game {
  public players: (Player | null)[] = [];
  public walls: Wall[] = [];
  public discards: Discard[] = [];
  public state: GameState = GameState.Init;
  public latestTile: TileId = TileCore.voidTileId;
  public current: Player | null = null;
  public dealer: Player | null = null;
  public pickPosition: Position = Position.East;
  public pickIndex: number = 0;
  public reversePickPosition: Position = Position.East;
  public reversePickIndex: number = 0;

  constructor() {
    //
  }

  // Methods
  init() {
    // 0: 东，1: 南，2: 西，3: 北
    this.players = [];
    this.players.length = 4;

    // wall
    this.walls.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.walls[position] = new Wall(position);
      this.walls[position].tiles.length = TileCore.allTiles.length / 4;
      this.walls[position].tiles.fill(TileCore.voidTileId);
    }

    // discard
    this.discards.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.discards[position] = new Discard(position);
    }

    this.state = GameState.Init;
    this.latestTile = TileCore.voidTileId;
    this.current = null;
    this.dealer = null;
  }

  /**
   * players
   */
  setPlayer(player: Player): void {
    this.players[player.position] = player;
  }

  setCurrentPlayer(player: Player): Game {
    this.current = player;
    return this;
  }

  getCurrentPlayer() {
    return this.current;
  }

  getNextPlayer() {
    let pos = this.current?.position as Position;
    const direction = 1;
    while (!this.players[(pos + direction) % 4]) {
      pos += direction;
    }
    return this.players[(pos + direction) % 4];
  }

  shuffleArray<T>(tiles: T[]) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  }

  sortArray<T>(tiles: T[]) {
    tiles.sort((a, b) => (a > b ? 1 : -1));
  }

  /**
   * shuffle tiles and add to walls
   */
  shuffle() {
    const tiles = TileCore.allTiles.slice().map((tile) => tile.id);
    this.shuffleArray(tiles);

    for (let index = 0; index < this.walls.length; index++) {
      this.walls[index].tiles = tiles.slice(
        index * (tiles.length / 4),
        (index + 1) * (tiles.length / 4),
      );
    }
  }

  /**
   * assign a player as dealer
   */
  assignDealer() {
    const players = this.players.filter((player) => player) as Player[];
    // const dealer = players[Math.floor(Math.random() * players.length)];
    const dealer = players[0];

    this.dealer = dealer;
    this.current = dealer;
  }

  dice(): this {
    if (!this.dealer) {
      throw new Error("dealer is not assigned");
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    this.pickPosition = (this.dealer?.position + dice1 + dice2) % 4;
    this.pickIndex = (Math.max(dice1, dice2) + 1) * 2;

    this.reversePickPosition = this.pickPosition;
    this.reversePickIndex = this.pickIndex - 1;

    return this;
  }

  getDealer(): Player {
    return this.dealer as Player;
  }

  pickTile(from: "start" | "end" = "start"): TileId {
    if (from === "start") {
      const wall = this.walls[this.pickPosition];
      const taken = wall.tiles[this.pickIndex];
      wall.tiles[this.pickIndex] = TileCore.voidTileId;

      this.pickIndex++;
      if (this.pickIndex >= this.walls[this.pickPosition].tiles.length) {
        this.pickIndex = 0;
        this.pickPosition = (this.pickPosition + 1) % 4;
      }
      return taken;
    } else {
      const wall = this.walls[this.reversePickPosition];
      const upper = Math.floor(this.reversePickIndex / 2) * 2; // 上面一个
      const pick = wall.tiles[upper] ? upper : upper + 1; // 上面一个不为空，取上面一个，否则去下面一个
      const taken = wall.tiles[pick];
      wall.tiles[pick] = TileCore.voidTileId;

      this.reversePickIndex--;
      if (this.reversePickIndex < 0) {
        this.reversePickIndex =
          this.walls[this.reversePickPosition].tiles.length - 1;
        this.reversePickPosition = (this.reversePickPosition + 3) % 4;
      }
      return taken;
    }
  }

  dispatch(): this {
    // dispatch tiles to players
    // rules
    // 1. players start from the dealer, then the next valid player
    // 2. each player gets 4 tiles for 3 times
    // 3. each player gets 1 tile for 1 time
    // 4. the dealer gets 1 more tile
    // 6. pick from the wall with position == this.pickPosition, index from this.pickIndex
    // 7. when picked, the wall[picked] = TileCore.voidTileId

    if (!this.dealer) {
      throw new Error("dealer is not assigned");
    }

    this.state = GameState.Dispatching;

    // each player pick 12 tiles
    for (let i = 0; i < 3; i++) {
      let position = this.dealer.position;
      for (let j = 0; j < 4; j++) {
        const player = this.players[position];
        position = (position + 1) % 4;
        if (player) {
          player.handTiles.push(this.pickTile());
          player.handTiles.push(this.pickTile());
          player.handTiles.push(this.pickTile());
          player.handTiles.push(this.pickTile());
        }
      }
    }

    // each player pick 1 tile
    {
      let position = this.dealer.position;
      for (let j = 0; j < 4; j++) {
        const player = this.players[position];
        position = (position + 1) % 4;
        if (player) {
          player.handTiles.push(this.pickTile());
        }
      }
    }

    // dealer pick 1 more tile
    {
      this.dealer.handTiles.push(this.pickTile());
    }

    {
      // sort hand tiles
      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];
        if (player) {
          player.handTiles.sort((a, b) => a - b);
        }
      }
    }

    {
      this.dealer.picked = this.dealer.handTiles.pop() as TileId;
    }

    return this;
  }

  pick(player: Player): this {
    /**
     * check player is current player
     * check player's picked is voidTile
     * pick a tile from the wall
     */
    if (this.current !== player) {
      throw new Error("not your turn");
    }

    if (player.picked !== TileCore.voidTileId) {
      throw new Error("you have already picked a tile");
    }

    player.picked = this.pickTile();

    return this;
  }

  discard(player: Player, tile: TileId): this {
    /**
     * check player is current player
     * check the tile is in player's handTiles or picked
     * discard the tile to disards
     */
    if (this.current !== player) {
      throw new Error("not your turn");
    }

    const index = player.handTiles.indexOf(tile);
    if (index === -1 && player.picked !== tile) {
      throw new Error("tile is not in your hand");
    }

    if (index !== -1) {
      player.handTiles.splice(index, 1);
      player.handTiles.push(player.picked);
      player.picked = TileCore.voidTileId;
    } else {
      player.picked = TileCore.voidTileId;
    }

    this.discards[player.position].tiles.push(tile);

    return this;
  }

  pass(player: Player): this {
    // player passes, do not peng, chi, gang or hu
    void player;

    return this;
  }

  canChi(player: Player, tiles: number[]) {
    // check if the player can chi
    void [player, tiles];
  }

  chi(player: Player, tiles: number[]) {
    // player chis
    void [player, tiles];
  }

  canPeng(player: Player, tiles: number[]) {
    // check if the player can peng
    void [player, tiles];
  }

  peng(player: Player, tiles: number[]) {
    // player pengs
    void [player, tiles];
  }

  canGang(player: Player, tiles: number[]) {
    //
    void [player, tiles];
  }

  gang(player: Player, tiles: number[]) {
    // player gangs
    void [player, tiles];
  }

  canAngang(player: Player, tiles: number[]) {
    // check if the player can an gang
    void [player, tiles];
  }

  angang(player: Player, tiles: number[]) {
    // player an gangs
    void [player, tiles];
  }

  canHuZimo(player: Player) {
    // check if the player can hu zimo
    void [player];
  }

  huZimo(player: Player) {
    // player hus
    void [player];
  }

  canHuFangchong(player: Player) {
    //
    void [player];
  }

  endGame() {
    //
  }

  canHu(tiles: TileId[]): boolean {
    /**
     * 0. sort tiles
     * 1. loop the tiles and all possible pairs
     * 2. for each pairs
     *  a) copy the original tiles and remove the pair
     *  b) check if the rest tiles can be 3 tiles group
     */

    if (tiles.length !== 14) {
      return false;
    }

    // sort tiles
    TileCore.sortTiles(tiles);

    for (let i = 0; i < tiles.length - 1; i++) {
      if (TileCore.isSame(tiles[i], tiles[i + 1])) {
        const rest = tiles.slice(i, 2);

        const result = [];

        while (rest.length >= 3) {
          if (TileCore.isSame(rest[0], rest[1], rest[2])) {
            result.push([rest[0], rest[1], rest[2]]);
            rest.splice(0, 3);
            continue;
          }

          const t1 = 0;
          let t2 = 0;
          let t3 = 0;

          // find a consecutive tiles for t1
          for (let j = t1 + 1; j < rest.length - 1; j++) {
            if (TileCore.isConsecutive(rest[t1], rest[j])) {
              t2 = j;
              break;
            }
          }
          if (!t2) {
            break;
          }

          // find a consecutive tiles for t2
          for (let j = t2 + 1; j < rest.length; j++) {
            if (TileCore.isConsecutive(rest[t2], rest[j])) {
              t3 = j;
              break;
            }
          }
          if (!t3) {
            break;
          }

          result.push([rest[t1], rest[t2], rest[t3]]);
          rest.splice(t3, 1);
          rest.splice(t2, 1);
          rest.splice(t1, 1);
        }

        return rest.length === 0;
      }
    }

    return true;
  }

  extractAllPaires(tiles: TileId[]) {
    // find all possible pairs
    const pairs: TileId[][] = [];

    let i = 0;
    while (i < tiles.length - 1) {
      if (
        TileCore.fromId(tiles[i]).name !== TileCore.fromId(tiles[i + 1]).name
      ) {
        continue;
      }
      pairs.push([i, i + 1]);

      const first = i;

      // change i to next tile with diffent name
      while (
        i < tiles.length - 1 &&
        TileCore.fromId(first).name === TileCore.fromId(tiles[i + 1]).name
      ) {
        i++;
      }
    }
    return tiles;
  }

  /**
   *
   */
  allOnePatterns(tiles: TileId[], patternType: string) {
    const patterns: TileId[][] = [];

    if (patternType === "same-3") {
      const tids = tiles.slice();

      for (let i = 0; i < tids.length; i++) {}
    }

    for (let i = 0; i < tiles.length; i++) {
      patterns.push([tiles[i]]);
    }

    return patterns;
  }

  /**
   * find all possible combination
   */
  allPatterns(tiles: TileId[], patternType: string) {
    if (patternType === "same-3") {
      return this.allOnePatterns(tiles, patternType);
    }

    return [];
  }
}
