import { Game, Player, Position } from "../core/mj.game";
import { RoomModel } from "./room.model";

// class State {
//   name: string;
//   gameModel: MjGameModel;
//   onEnter(data: unknown): void;
//   onLeave(): void;
//   onEvent(event: string, data: unknown): void;
// }

// const defaultState: State = {
//   name: "default",
//   gameModel: null,
//   onEnter(data: unknown) {
//     void data;
//   },
//   onLeave() {},
//   onEvent() {},
// };

export class MjGameModel {
  constructor(
    public room: RoomModel,
    public mjGame: Game = new Game(),
  ) {}

  /**
   * State machine
   */
  // public previousState: State = null;
  // public currentState: State = null;

  // public initState: State = defaultState;
  // public shuffleState: State = defaultState;
  // public diceState: State = defaultState;
  // public distributeState: State = defaultState;
  // public playingState: State = defaultState;
  // public endState: State = defaultState;

  // toState(state: State, data: any = null) {
  //   if (this.currentState) {
  //     this.currentState.onLeave();
  //   }
  //   this.previousState = this.currentState;
  //   this.currentState = state;
  //   this.currentState.onEnter(data);
  // }

  // toInitState() {
  //   this.toState(this.initState);
  // }
  // toShuffleState() {
  //   this.toState(this.shuffleState);
  // }
  // toDiceState() {
  //   this.toState(this.diceState);
  // }
  // toDistributeState() {
  //   this.toState(this.distributeState);
  // }
  // toPlayingState() {
  //   this.toState(this.playingState);
  // }
  // toEndState() {
  //   this.toState(this.endState);
  // }

  startGame() {
    /**
     * 1. create mj game instance
     *    state - initing
     * 2. shuffle tiles (sync)
     *    state - shuffling
     *    broadcast to players
     *    timer - 1s
     * 3. dice tiles (sync)
     *    state - dicing
     *    broadcasting to players
     *    timer - 2s
     *    state - diced
     *    broadcasting to players
     *    timer - 1s
     * 4. distribute tiles to players
     *    state - distributing
     *    broadcasting to players
     *    loop ...
     * 5. playing game
     *    state - playing
     *    broadcasting to players
     *    loop
     *       for human player: wait for action
     *       for bot player: auto action (timer - 1s)
     *    1. current player:
     *       after pick/gang-self: discard, gang, hu
     *       after peng/chi/gang-other: discard, gang
     *       broadcast to players
     *    2. tile discarded
     *       if can peng/chi/gang/hu: wait for action (peng/chi/gang/hu/pass)
     *       if no action or all pass, timer - 1s
     *    3.
     */
    console.log("start game");

    this.mjGame.init();
    this.mjGame.setPlayer(new Player(Position.East));
    this.mjGame.shuffle();
    this.mjGame.assignDealer();
    this.mjGame.dice();
    this.mjGame.dispatch();
  }

  async shuffle() {
    console.log("shuffle");
  }

  toJSON() {
    return {
      mjGame: this.mjGame,
    };
  }
}
