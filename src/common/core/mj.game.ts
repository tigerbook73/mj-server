import { type TileId, TileCore } from "./mj.tile-core";

/**
 * 动作类型
 */
export const enum ActionType {
  Peng = "peng",
  Chi = "chi",
  Gang = "gang",
  AnGang = "angang",
  Hu = "hu",
}

/**
 * 玩家的位置
 */
export const enum Position {
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
export const enum GameState {
  Init = "init", // 初始
  Dispatching = "dispatching", // 发牌中，后续可以拆分成更小的状态
  WaitingAction = "wating_action", // 等待玩家操作: 胡/暗杠/打牌
  WaitingPass = "waiting-pass", // 等待玩家按顺序操作: 过/碰/杠/吃/胡, 在这个状态下，下一个玩家还没有确定，current还是打出牌的玩家
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

  /**
   * 初始化，进入发牌前状态
   */
  public init(positions: Position[]) {
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
    this.setLatestTile(TileCore.voidId);

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

    // add players
    for (let i = 0; i < positions.length; i++) {
      this.setPlayer(new Player(positions[i]));
    }
  }

  /**
   * 开始游戏，指定庄家、发牌，进入 WaitingAction 状态
   */
  public start() {
    this.assignDealer();
    this.dice();
    this.dispatch();
  }

  /**
   * 打牌，打完牌后进入 WaitingPass 状态
   */
  public drop(tile: TileId): this {
    if (![GameState.WaitingAction].includes(this.state)) {
      throw new Error("Discard can only be done in WaitingAction state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const index = this.current.handTiles.indexOf(tile);
    if (index === -1 && this.current.picked !== tile) {
      throw new Error("tile is not in your hand");
    }

    if (index !== -1) {
      this.current.handTiles.splice(index, 1);
      this.current.handTiles.push(this.current.picked);
      this.current.handTiles.sort((a, b) => a - b);
      this.current.picked = TileCore.voidId;
    } else {
      this.current.picked = TileCore.voidId;
    }

    this.discards[this.current.position].tiles.push(tile);

    this.setLatestTile(tile);
    this.setState(GameState.WaitingPass);

    return this;
  }

  /**
   * 暗杠, 暗杠后仍然是WaitingAction状态
   */
  public angang(tileIds: [TileId, TileId, TileId, TileId]) {
    if (![GameState.WaitingAction].includes(this.state)) {
      throw new Error("Gang can only be done in WaitingAction state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    // check if the tiles are the same
    if (!TileCore.isSame(tileIds[0], tileIds[1], tileIds[2], tileIds[3])) {
      throw new Error("tiles are not the same");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(this.current, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // remove the tiles from the hand
    this.removeTilesFromHand(this.current, tileIds);

    // add to opened sets
    this.current.openedSets.push(
      new OpenedSet(
        [tileIds[0], tileIds[1], tileIds[2], tileIds[3]],
        TileCore.voidId,
        ActionType.AnGang,
        this.current.position,
      ),
    );

    this.setLatestTile(TileCore.voidId);
    this.setState(GameState.WaitingPass);

    this.pickReverse();
    this.setState(GameState.WaitingAction);
  }

  /**
   * 自摸胡, 自摸胡后进入 End 状态
   */
  public huZhimo(): this {
    if (![GameState.WaitingAction].includes(this.state)) {
      throw new Error("Hu can only be done in WaitingAction state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const tileIds = this.current.handTiles.slice();
    tileIds.push(this.current.picked);

    if (!this.canHu(tileIds)) {
      throw new Error("you cannot hu");
    }

    this.setState(GameState.End);
    return this;
  }

  /**
   * 过，所有其他玩家都过了以后，下一个玩家变为当前玩家，抓牌，进入 WaitingAction 状态
   */
  public pass(player: Player): this {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Pass can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    if (this.current === player) {
      // throw new Error("current player cannot pass");
      // ignore
      return this;
    }

    // ignore if the player has already passed
    if (this.passedPlayers.includes(player)) {
      return this;
    }

    this.passedPlayers.push(player);

    if (this.allPassed()) {
      this.setCurrentPlayer(this.getNextPlayer());
      this.pick();
      this.setLatestTile(TileCore.voidId);
      this.setState(GameState.WaitingAction);
    }

    return this;
  }

  /**
   * 吃, 吃完后进入 WaitingAction 状态
   */
  public chi(tileIds: [TileId, TileId]): this {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Chi can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const player = this.getNextPlayer();

    // check if the tiles are consecutive
    if (!TileCore.isConsecutive(tileIds[0], tileIds[1], this.latestTile)) {
      throw new Error("tiles are not consecutive");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(player, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // remove the tiles from the hand
    this.removeTilesFromHand(player, tileIds);

    // add to opened sets
    player.openedSets.push(
      new OpenedSet(
        [tileIds[0], tileIds[1], this.latestTile],
        this.latestTile,
        ActionType.Chi,
        this.current.position,
      ),
    );

    this.setCurrentPlayer(this.getNextPlayer());
    this.setLatestTile(TileCore.voidId);
    this.setState(GameState.WaitingAction);
    return this;
  }

  /**
   * 碰, 碰完后进入 WaitingAction 状态
   */
  public peng(tileIds: [TileId, TileId]) {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Peng can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const player = this.getNextPlayer();

    // check if the tiles are consecutive
    if (!TileCore.isSame(tileIds[0], tileIds[1], this.latestTile)) {
      throw new Error("tiles are not consecutive");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(player, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // remove the tiles from the hand
    this.removeTilesFromHand(player, tileIds);

    // add to opened sets
    player.openedSets.push(
      new OpenedSet(
        [tileIds[0], tileIds[1], this.latestTile],
        this.latestTile,
        ActionType.Peng,
        this.current.position,
      ),
    );

    this.setCurrentPlayer(this.getNextPlayer());
    this.setLatestTile(TileCore.voidId);
    this.setState(GameState.WaitingAction);
    return this;
  }

  /**
   * 杠, 杠完后进入 WaitingAction 状态
   */
  public gang(tileIds: [TileId, TileId, TileId]) {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Gang can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const player = this.getNextPlayer();

    // check if the tiles are consecutive
    if (!TileCore.isSame(tileIds[0], tileIds[1], tileIds[2], this.latestTile)) {
      throw new Error("tiles are not the same");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(player, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // remove the tiles from the hand
    this.removeTilesFromHand(player, tileIds);

    // add to opened sets
    player.openedSets.push(
      new OpenedSet(
        [tileIds[0], tileIds[1], tileIds[2], this.latestTile],
        this.latestTile,
        ActionType.Gang,
        this.current.position,
      ),
    );

    this.setCurrentPlayer(this.getNextPlayer());
    this.setLatestTile(TileCore.voidId);
    this.setState(GameState.WaitingAction);
    return this;
  }

  /**
   * 胡, 胡完后进入 End 状态
   */
  public hu(player: Player) {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Hu can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    const tileIds = player.handTiles.slice();
    if (player.picked !== TileCore.voidId) {
      tileIds.push(player.picked);
    }

    if (this.latestTile !== TileCore.voidId) {
      tileIds.push(this.latestTile);
    }

    if (!this.canHu(tileIds)) {
      throw new Error("you cannot hu");
    }

    this.setState(GameState.End);
    return this;
  }

  /**
   * set the game state
   */
  setState(state: GameState): this {
    this.state = state;
    return this;
  }

  /**
   * check if the tile is in the player's hand
   */
  isTileInHand(player: Player, tiles: TileId | TileId[]): boolean {
    if (!Array.isArray(tiles)) {
      tiles = [tiles];
    }

    for (let i = 0; i < tiles.length; i++) {
      if (player.handTiles.indexOf(tiles[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  removeTilesFromHand(player: Player, tiles: TileId | TileId[]) {
    if (!Array.isArray(tiles)) {
      tiles = [tiles];
    }

    for (const tile of tiles) {
      const index = player.handTiles.indexOf(tile);
      if (index !== -1) {
        player.handTiles.splice(index, 1);
      }
    }
  }

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
   * find the next player
   *
   * @param player if not set, use the current player
   */
  getNextPlayer(player: Player | null = null): Player {
    player = player || this.current;
    if (!player) {
      throw new Error("current player is not set");
    }

    let pos = player.position as Position;
    const direction = 1;
    while (!this.players[(pos + direction) % 4]) {
      pos += direction;
    }
    return this.players[(pos + direction) % 4] as Player;
  }

  /**
   * set the latest tile
   */
  setLatestTile(tile: TileId = TileCore.voidId): void {
    this.latestTile = tile;
  }

  /**
   * shuffle the tiles
   */
  shuffleArray<T>(tiles: T[]) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  }

  /**
   * sort the tiles
   */
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

  pickTile(bReverse: boolean = false): TileId {
    if (!bReverse) {
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

  pick(): this {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Pick can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    if (!this.allPassed()) {
      throw new Error("Pick can only be done when all players have passed");
    }

    if (this.current.picked !== TileCore.voidId) {
      throw new Error("you have already picked a tile");
    }

    this.current.picked = this.pickTile();

    return this;
  }

  pickReverse() {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Pick can only be done when all players have passed");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    if (this.current.picked !== TileCore.voidId) {
      throw new Error("you have already picked a tile");
    }

    this.current.picked = this.pickTile(true);
    return this;
  }

  allPassed() {
    return (
      this.passedPlayers.length ===
      this.players.filter((player) => player).length - 1
    );
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

  /**
   * Serialize the game state to a JSON object
   */
  public serialize(): unknown {
    return {
      players: this.players.map((player) =>
        player
          ? {
              position: player.position,
              handTiles: player.handTiles,
              picked: player.picked,
              openedSets: player.openedSets.map((set) => ({
                tiles: set.tiles,
                target: set.target,
                actionType: set.actionType,
                from: set.from,
              })),
            }
          : undefined,
      ),
      walls: this.walls.map((wall) => ({
        position: wall.position,
        tiles: wall.tiles,
      })),
      discards: this.discards.map((discard) => ({
        position: discard.position,
        tiles: discard.tiles,
      })),
      state: this.state,
      latestTile: this.latestTile,
      current: this.current ? this.current.position : null,
      dealer: this.dealer ? this.dealer.position : null,
      pickPosition: this.pickPosition,
      pickIndex: this.pickIndex,
      reversePickPosition: this.reversePickPosition,
      reversePickIndex: this.reversePickIndex,
      passedPlayers: this.passedPlayers.map((player) => player.position),
    };
  }

  /**
   * Deserialize the game state from a JSON object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static deserialize(data: any): Game {
    const game = new Game();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    game.players = data.players.map((playerData: any) =>
      playerData
        ? new Player(
            playerData.position,
            playerData.handTiles,
            playerData.picked,
            playerData.openedSets.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (set: any) =>
                new OpenedSet(set.tiles, set.target, set.actionType, set.from),
            ),
          )
        : undefined,
    );
    game.walls = data.walls.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (wallData: any) => new Wall(wallData.position, wallData.tiles),
    );
    game.discards = data.discards.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (discardData: any) =>
        new Discard(discardData.position, discardData.tiles),
    );
    game.state = data.state;
    game.latestTile = data.latestTile;
    game.current =
      data.current !== null ? game.players[data.current] || null : null;
    game.dealer =
      data.dealer !== null ? game.players[data.dealer] || null : null;
    game.pickPosition = data.pickPosition;
    game.pickIndex = data.pickIndex;
    game.reversePickPosition = data.reversePickPosition;
    game.reversePickIndex = data.reversePickIndex;
    game.passedPlayers = data.passedPlayers.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (position: any) => game.players[position],
    );
    return game;
  }
}
