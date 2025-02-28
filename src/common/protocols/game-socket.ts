import { io, Socket } from "socket.io-client";
import { GameRequest, GameResponse } from "./apis.models";

export class GameSocket {
  public socket: Socket | null = null;
  public connected = false;
  public connectedCallback = () => {};
  public disconnectedCallback = () => {};

  constructor() {
    // "undefined" means the URL will be computed from the `window.location` object
    this.socket = io(undefined);

    this.socket.on("connect", this.onConnected);
    this.socket.on("disconnect", this.onDisconnected);
  }

  private onConnected() {
    this.connected = true;
    console.log("Connected to the server");
    this.connectedCallback();
  }

  private onDisconnected() {
    this.connected = false;
    console.log("Connected to the server");
    this.disconnectedCallback();
  }

  onConnect(callback = () => {}) {
    this.connectedCallback = callback;
  }

  onDisconnect(callback = () => {}) {
    this.disconnectedCallback = callback;
  }

  send(data: unknown) {
    this.socket?.emit("mj:game", data);
  }

  sendAndWait<T>(data: GameRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () =>
          reject({
            type: data.type,
            status: "error",
            message: "timeout",
            data: null,
          }),
        1000,
      );
      this.socket?.emit("mj:game", data, (response: T) => {
        resolve(response);
        clearTimeout(timeout);
      });
    });
  }

  onReceive(callback: (data: GameResponse) => void) {
    this.socket?.on("mj:game", callback);
    return callback;
  }

  offReceive(callback: (data: GameResponse) => void) {
    this.socket?.off("mj:game", callback);
  }
}
