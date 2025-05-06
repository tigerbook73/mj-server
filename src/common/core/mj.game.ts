import { type TileId, TileCore } from "./mj.tile-core";

/**
 * 动作类型
 */
export const enum ActionType {
  Peng = "peng",
  Chi = "chi",
  Gang = "gang",
  Angang = "angang",
  Hu = "hu",
  Pass = "pass",
}

export const enum ActionResult {
  Waiting = "waiting", // waiting for action
  Passed = "passed", // action is passed (rejected)
  Accepting = "accepting", // action is accepting, however, there might be other high priority actions to be decided
  Accepted = "accepted", // action is accepted
}

/**
 * 动作的细节
 */
export class ActionDetail {
  constructor(
    public type: ActionType,
    public player: Player,
    public tiles: TileId[] = [],
    public status: ActionResult = ActionResult.Waiting,
  ) {}
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
  ) {
    this.tiles = tiles.sort();
  }

  static fromJSON(data: any): OpenedSet {
    return new OpenedSet(
      //
      data.tiles,
      data.target,
      data.actionType,
      data.from,
    );
  }
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

  static fromJSON(data: any): Player {
    return new Player(
      //
      data.position,
      data.handTiles,
      data.picked,
      data.openedSets.map((set: any) => OpenedSet.fromJSON(set)),
    );
  }
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

  static fromJSON(data: any): Wall {
    return new Wall(data.position, data.tiles);
  }
}

export class Discard {
  constructor(
    public position: Position = Position.East,
    public tiles: TileId[] = [],
  ) {}

  static fromJSON(data: any): Discard {
    return new Discard(data.position, data.tiles);
  }
}

export class Game {
  public players: (Player | null)[] = []; // 玩家
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

  public passedPlayers: Player[] = []; // 已经过的玩家，该属性仅用于client side
  public queuedActions: ActionDetail[] = []; // 等待处理的动作，该属性不用于Client Side

  constructor() {
    //
  }

  /**
   * 初始化，进入发牌前状态
   */
  public init(positions: Position[]) {
    // 0: 东，1: 南，2: 西，3: 北
    this.players = []; // 没有玩家的位置是null
    this.players.length = 4;
    for (let position = Position.East; position <= Position.North; position++) {
      this.players[position] = null;
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
    this.prepareQueueActions();

    // need a timeout
    this.handleQueuedActions();

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
        ActionType.Angang,
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
  public zimo(): this {
    if (![GameState.WaitingAction].includes(this.state)) {
      throw new Error("Hu can only be done in WaitingAction state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    if (!TileCore.canHu(this.current.handTiles, this.current.picked)) {
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

    // if decision is made, then ignore
    if (
      this.queuedActions.find(
        (action) =>
          action.player.position === player.position &&
          action.status !== ActionResult.Waiting,
      )
    ) {
      return this;
    }

    // passed all queued actions for the player
    for (const action of this.queuedActions) {
      if (action.player.position === player.position) {
        action.status = ActionResult.Passed;
      }
    }

    this.handleQueuedActions();
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

    // if decision is made, then ignore
    if (
      this.queuedActions.find(
        (action) =>
          action.player.position === player.position &&
          action.status !== ActionResult.Waiting,
      )
    ) {
      return this;
    }

    // update player's chi action => accepting, update player's other actions => passed
    for (const action of this.queuedActions) {
      if (action.player.position === player.position) {
        if (action.type === ActionType.Chi) {
          action.tiles = tileIds;
          action.status = ActionResult.Accepting;
        } else {
          action.status = ActionResult.Passed;
        }
      }
    }

    this.handleQueuedActions();
    return this;
  }

  /**
   * 碰, 碰完后进入 WaitingAction 状态
   */
  public peng(player: Player, tileIds: [TileId, TileId]) {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Peng can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    // check if the tiles are consecutive
    if (!TileCore.isSame(tileIds[0], tileIds[1], this.latestTile)) {
      throw new Error("tiles are not consecutive");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(player, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // if decision is made, then ignore
    if (
      this.queuedActions.find(
        (action) =>
          action.player.position === player.position &&
          action.status !== ActionResult.Waiting,
      )
    ) {
      return this;
    }

    // update player's peng action => accepting, update player's other actions => passed
    for (const action of this.queuedActions) {
      if (action.player.position === player.position) {
        if (
          action.type === ActionType.Peng ||
          action.type === ActionType.Gang
        ) {
          action.tiles = tileIds;
          action.type = ActionType.Peng; // change queue action to peng
          action.status = ActionResult.Accepting;
        } else {
          action.status = ActionResult.Passed;
        }
      }
    }

    this.handleQueuedActions();
    return this;
  }

  /**
   * 杠, 杠完后进入 WaitingAction 状态
   */
  public gang(player: Player, tileIds: [TileId, TileId, TileId]) {
    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error("Gang can only be done in WaitingPass state");
    }

    if (!this.current) {
      throw new Error("current player is not set");
    }

    // check if the tiles are consecutive
    if (!TileCore.isSame(tileIds[0], tileIds[1], tileIds[2], this.latestTile)) {
      throw new Error("tiles are not the same");
    }

    // check if the tiles are in the hand
    if (!this.isTileInHand(player, tileIds)) {
      throw new Error("tiles are not in your hand");
    }

    // if decision is made, then ignore
    if (
      this.queuedActions.find(
        (action) =>
          action.player.position === player.position &&
          action.status !== ActionResult.Waiting,
      )
    ) {
      return this;
    }

    // update player's gang action => accepting, update player's other actions => passed
    for (const action of this.queuedActions) {
      if (action.player.position === player.position) {
        if (action.type === ActionType.Gang) {
          action.tiles = tileIds;
          action.status = ActionResult.Accepting;
        } else {
          action.status = ActionResult.Passed;
        }
      }
    }

    this.handleQueuedActions();
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

    if (
      !TileCore.canHu(
        player.handTiles,
        player.picked !== TileCore.voidId ? player.picked : this.latestTile,
      )
    ) {
      throw new Error("you cannot hu");
    }

    // if decision is made, then ignore
    if (
      this.queuedActions.find(
        (action) =>
          action.player.position === player.position &&
          action.status !== ActionResult.Waiting,
      )
    ) {
      return this;
    }

    // update player's hu action => accepting, update player's other actions => passed
    for (const action of this.queuedActions) {
      if (action.player.position === player.position) {
        action.status =
          action.type === ActionType.Hu
            ? ActionResult.Accepting
            : ActionResult.Passed;
      }
    }

    this.handleQueuedActions();
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
   * prepare the queue actions
   */
  private prepareQueueActions(): this {
    if (this.state !== GameState.WaitingPass) {
      throw new Error(
        "Queue actions can only be prepared in WaitingPass state",
      );
    }

    this.queuedActions = [];

    /**
     * add possible action results to the queuedActions (from high priority to low priority)
     * + add hu actions
     * + add peng/gang actions
     * + add chi action
     */

    // hu actions
    for (
      let player = this.getNextPlayer();
      player !== this.current;
      player = this.getNextPlayer(player)
    ) {
      if (TileCore.canHu(player.handTiles, this.latestTile)) {
        this.queuedActions.push(new ActionDetail(ActionType.Hu, player));
      }
    }

    // peng/gang actions
    for (
      let player = this.getNextPlayer();
      player !== this.current;
      player = this.getNextPlayer(player)
    ) {
      if (TileCore.canGang(player.handTiles, this.latestTile)) {
        this.queuedActions.push(new ActionDetail(ActionType.Gang, player));
      } else if (TileCore.canPeng(player.handTiles, this.latestTile)) {
        this.queuedActions.push(new ActionDetail(ActionType.Peng, player));
      }
    }

    // chi action
    const player = this.getNextPlayer();
    if (player !== this.current) {
      if (TileCore.canChi(player.handTiles, this.latestTile)) {
        this.queuedActions.push(new ActionDetail(ActionType.Chi, player));
      }
    }

    return this;
  }

  /**
   * Handles the scenario where all players have passed their turn.
   * If all players have passed, it performs the following actions:
   * - Sets the current player to the next player.
   * - Picks a tile for the current player.
   * - Sets the latest tile to a void ID.
   * - Updates the game state to `WaitingAction`.
   */
  private handleQueuedActions(): this {
    if (this.queuedActions.length === 0) {
      this.setCurrentPlayer(this.getNextPlayer());
      this.pick();
      this.setLatestTile(TileCore.voidId);
      this.setState(GameState.WaitingAction);
      return this;
    }

    if (![GameState.WaitingPass].includes(this.state)) {
      throw new Error(
        "Queued actions can only be handled in WaitingPass state",
      );
    }

    // from high priority to low priority
    for (const action of this.queuedActions) {
      // if passed, skip
      if (action.status === ActionResult.Passed) {
        continue;
      }

      // if waiting, nothing to be handdled
      if (action.status === ActionResult.Waiting) {
        return this;
      }

      // then handle the current action: chi/peng/gang/hu

      if (action.type === ActionType.Chi || action.type === ActionType.Peng) {
        // update state
        action.status = ActionResult.Accepted;

        // remove the tiles from the hand
        this.removeTilesFromHand(action.player, action.tiles);

        // add to opened sets
        action.player.openedSets.push(
          new OpenedSet(
            [...action.tiles, this.latestTile] as OpenedSet["tiles"],
            this.latestTile,
            action.type,
            action.player.position,
          ),
        );

        // clear queued actions and the latest tile
        this.queuedActions = [];
        this.setLatestTile(TileCore.voidId);

        // update the current player
        this.setCurrentPlayer(action.player);
        this.setState(GameState.WaitingAction);

        return this;
      }

      if (action.type === ActionType.Gang) {
        action.status = ActionResult.Accepted;

        // remove the tiles from the hand
        this.removeTilesFromHand(action.player, action.tiles);

        // add to opened sets
        action.player.openedSets.push(
          new OpenedSet(
            [...action.tiles, this.latestTile] as OpenedSet["tiles"],
            this.latestTile,
            action.type,
            action.player.position,
          ),
        );

        // clear queued actions and the latest tile
        this.queuedActions = [];
        this.setLatestTile(TileCore.voidId);

        // update the current player and pick a tile from the reverse side
        this.setCurrentPlayer(action.player);
        this.pickReverse();
        this.setState(GameState.WaitingAction);

        return this;
      }
    }

    // no actions queued or all passed

    // clear queued actions and the latest tile
    this.queuedActions = [];
    this.setLatestTile(TileCore.voidId);

    this.setCurrentPlayer(this.getNextPlayer());
    this.pick();
    this.setState(GameState.WaitingAction);

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
    const direction = -1;
    while (!this.players[(pos + direction + 4) % 4]) {
      pos += direction;
    }
    return this.players[(pos + direction + 4) % 4] as Player;
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
        position = (position - 1 + 4) % 4;
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
        position = (position - 1 + 4) % 4;
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

  public toJSON() {
    // prepare passed players
    const passedPlayers: Player[] = [];
    if (this.state === GameState.WaitingPass) {
      for (
        let player = this.current ? this.getNextPlayer() : this.current;
        player !== this.current;
        player = this.getNextPlayer(player)
      ) {
        // if the first queue action is not waiting, then the player is passed (acted!)
        if (
          this.queuedActions.find((action) => action.player === player)
            ?.status !== ActionResult.Waiting
        ) {
          passedPlayers.push(player!);
        }
      }
    }

    return {
      players: this.players,
      walls: this.walls,
      discards: this.discards,
      state: this.state,
      latestTile: this.latestTile,
      current: this.current ? this.current.position : null,
      dealer: this.dealer ? this.dealer.position : null,
      pickPosition: this.pickPosition,
      pickIndex: this.pickIndex,
      reversePickPosition: this.reversePickPosition,
      reversePickIndex: this.reversePickIndex,
      passedPlayers: passedPlayers.map((player) => player.position),
    };
  }

  static fromJSON(data: any): Game {
    const game = new Game();
    game.players = data.players.map((playerData: any) =>
      playerData ? Player.fromJSON(playerData) : null,
    );
    game.walls = data.walls.map((wallData: any) => Wall.fromJSON(wallData));
    game.discards = data.discards.map((discardData: any) =>
      Discard.fromJSON(discardData),
    );
    game.state = data.state;
    game.latestTile = data.latestTile;
    game.current = data.current !== null ? game.players[data.current] : null;
    game.dealer = data.dealer !== null ? game.players[data.dealer] : null;
    game.pickPosition = data.pickPosition;
    game.pickIndex = data.pickIndex;
    game.reversePickPosition = data.reversePickPosition;
    game.reversePickIndex = data.reversePickIndex;
    game.passedPlayers = data.passedPlayers.map(
      (position: Position) => game.players[position],
    );
    return game;
  }
}
