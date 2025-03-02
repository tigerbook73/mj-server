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
    public tiles: [TileId, TileId, TileId, TileId] | [TileId, TileId, TileId], // 碰，吃，杠后的牌
    public target: TileId, // 碰，吃，杠的目标牌
    public actionType: ActionType,
    public from: Position, // 来自哪个玩家
  ) {}
}

/**
 * 玩家
 */
export class Player {
  constructor(
    public position: Position, // 玩家的位置
    public handTiles: TileId[] = [], // 玩家手里的牌，不包含已经碰，吃，杠的牌
    public picked: TileId = TileCore.voidId, // 玩家最后一次摸的牌
    public openedSets: OpenedSet[] = [], // 玩家已经碰，吃，杠的牌
  ) {}
}

/**
 * 游戏状态
 */
export enum GameState {
  Init = "init", // 初始
  Dispatching = "dispatching", // 发牌中，后续可以拆分成更小的状态
  WaitingAction = "wating_action", // 等待玩家操作: 胡/暗杠/打牌
  WaitingPass = "waiting-pass", // 等待玩家按顺序操作: 过/碰/杠/吃/胡
  // 顺序：
  // 判断是否有人碰/胡/杠/吃
  // 如果有
  //   按照优先级等待玩家操作：胡/[碰/杠]/吃，或过
  //      胡 -> 结束
  //      碰 -> WaitingAction
  //      杠 -> WaitingAction
  //      吃 -> WaitingAction
  //      过 -> WaitingPass
  // 如果没有或者全过 -> 发牌 -> 进入下一轮的WaitingAction
  End = "end", // 游戏结束
}

/**
 *
 */
export class Wall {
  constructor(
    public position: Position = Position.East,
    public tiles: TileId[] = [],
  ) {}
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
  public players: (Player | undefined)[] = []; // 玩家
  public walls: Wall[] = []; // 牌墙
  public discards: Discard[] = []; // 打出的牌
  public state: GameState = GameState.Init; // 游戏状态
  public latestTile: TileId = TileCore.voidId; // 最后一张打出的牌
  public current: Player | null = null; // 当前玩家
  public dealer: Player | null = null; // 庄家
  public pickPosition: Position = Position.East; // 摸牌位置（东南西北）
  public pickIndex: number = 0; // 摸牌位置
  public reversePickPosition: Position = Position.East; // 反向摸牌位置（东南西北）(杠)
  public reversePickIndex: number = 0; // 反向摸牌位置

  public passedPlayers: Player[] = []; // 已经过的玩家, 仅用于 WaitingPass 状态

  constructor() {
    //
  }

  init() {
    // 0: 东，1: 南，2: 西，3: 北
    this.players = []; // 没有玩家的位置是undefined
    this.players.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.players[position] = undefined;
    }

    // wall
    this.walls = [];
    this.walls.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.walls[position] = new Wall(position);
      this.walls[position].tiles.length = TileCore.allTiles.length / 4;
      this.walls[position].tiles.fill(TileCore.voidId);
    }

    // discard
    this.discards = [];
    this.discards.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.discards[position] = new Discard(position);
    }

    // latest tile
    this.latestTile = TileCore.voidId;

    // current player
    this.current = null;

    // dealer
    this.dealer = null;

    // pick position, will be changed after dice
    this.pickPosition = Position.East;
    this.pickIndex = 0;
    this.reversePickPosition = Position.North;
    this.reversePickIndex = 0;

    // shuffle
    this.shuffle();

    // game state
    this.setState(GameState.Init);
  }

  start() {
    this.assignDealer();
    this.dice();
    this.dispatch();
  }

  setState(state: GameState) {
    this.state = state;

    // reset state specific variables
    this.passedPlayers = [];
  }

  /**
   * players
   */

  /**
   * add player to the game
   */
  setPlayer(player: Player): void {
    if (![GameState.Init].includes(this.state)) {
      throw new Error("Players can only be set in init state");
    }

    this.players[player.position] = player;
  }

  /**
   * Set the current player
   */
  setCurrentPlayer(player: Player): Game {
    if (![GameState.Dispatching, GameState.WaitingPass].includes(this.state)) {
      throw new Error(
        "Current player can only be set in Dispatching/WaitingPass state",
      );
    }

    this.current = player;
    return this;
  }

  /**
   * find the next player of the current player
   *
   * Note: this method does not change the current player
   */
  getNextPlayer(): Player {
    if (!this.current) {
      throw new Error("current player is not set");
    }

    let pos = this.current.position as Position;
    const direction = 1;
    while (!this.players[(pos + direction) % 4]) {
      pos += direction;
    }
    return this.players[(pos + direction) % 4] as Player;
  }

  /**
   *
   * @param tiles
   */
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
    if (![GameState.Init].includes(this.state)) {
      throw new Error("Dealer can only be assigned in init state");
    }

    const players = this.players.filter((player) => player) as Player[];
    // const dealer = players[Math.floor(Math.random() * players.length)];
    const dealer = players[0];

    this.dealer = dealer;
  }

  dice(): this {
    if (!this.dealer) {
      throw new Error("dealer is not assigned");
    }

    if (![GameState.Init].includes(this.state)) {
      throw new Error("Dice can only be rolled in init state");
    }

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    this.pickPosition = (this.dealer?.position + dice1 + dice2) % 4;
    this.pickIndex = (Math.max(dice1, dice2) + 1) * 2;

    this.reversePickPosition = this.pickPosition;
    this.reversePickIndex = this.pickIndex - 1;

    return this;
  }

  pickTile(from: "start" | "end" = "start"): TileId {
    if (from === "start") {
      const wall = this.walls[this.pickPosition];
      const taken = wall.tiles[this.pickIndex];
      wall.tiles[this.pickIndex] = TileCore.voidId;

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
      wall.tiles[pick] = TileCore.voidId;

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
    // 7. when picked, the wall[picked] = TileCore.voidId

    if (!this.dealer) {
      throw new Error("dealer is not assigned");
    }

    if (![GameState.Init].includes(this.state)) {
      throw new Error("Dispatch can only be done in init state");
    }

    this.setState(GameState.Dispatching);

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

    this.setCurrentPlayer(this.dealer);
    this.setState(GameState.WaitingAction);

    return this;
  }

  pick(player: Player): this {
    if (
      ![GameState.WaitingPass].includes(this.state) ||
      this.passedPlayers.length !==
        this.players.filter((player) => player).length
    ) {
      throw new Error("Pick can only be done when all players have passed");
    }

    if (this.current !== player) {
      throw new Error("not your turn");
    }

    if (player.picked !== TileCore.voidId) {
      throw new Error("you have already picked a tile");
    }

    player.picked = this.pickTile();

    return this;
  }

  discard(player: Player, tile: TileId): this {
    if (![GameState.WaitingAction].includes(this.state)) {
      throw new Error("Discard can only be done in WaitingAction state");
    }

    if (this.current !== player) {
      throw new Error("player can only discard when it is his turn");
    }

    const index = player.handTiles.indexOf(tile);
    if (index === -1 && player.picked !== tile) {
      throw new Error("tile is not in your hand");
    }

    if (index !== -1) {
      player.handTiles.splice(index, 1);
      player.handTiles.push(player.picked);
      player.handTiles.sort((a, b) => a - b);
      player.picked = TileCore.voidId;
    } else {
      player.picked = TileCore.voidId;
    }

    this.discards[player.position].tiles.push(tile);

    this.latestTile = tile;

    this.setState(GameState.WaitingPass);

    return this;
  }

  pass(player: Player): this {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Pass can only be done in WaitingPass state");
    }

    // ignore if the player has already passed
    if (this.passedPlayers.includes(player)) {
      return this;
    }

    this.passedPlayers.push(player);

    if (
      this.passedPlayers.length ===
      this.players.filter((player) => player).length
    ) {
      this.setCurrentPlayer(this.getNextPlayer());
      this.pick(this.current as Player);
      this.setState(GameState.WaitingAction);
    }

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

    // only consider the hand tiles
    // if (tiles.length !== 14) {
    //   return false;
    // }

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
