import { Game, Position } from "../core/mj.game";
import { TileId } from "../core/mj.tile-core";
import { ClientModel } from "../models/client.model";
import { RoomCreateDto, RoomModel } from "../models/room.model";
import { UserModel } from "../models/user.model";
import { GameSocket } from "./game-socket";

export enum GameRequestType {
  // Authentication
  SIGN_IN = "signIn",
  SIGN_OUT = "signOut",

  // clients
  LIST_CLIENT = "listClient",

  // users
  LIST_USER = "listUser",
  DELETE_USER = "deleteUser",

  // rooms
  CREATE_ROOM = "createRoom",
  DELETE_ROOM = "deleteRoom",
  LIST_ROOM = "listRoom",
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",
  ENTER_GAME = "enterGame",
  QUIT_GAME = "quitGame",

  // MJGame
  START_GAME = "startGame",
  RESET_GAME = "resetGame",

  // Game Action
  DROP_TILE = "actionDropTile",
  PASS = "actionPass",
  CHI = "actionChi",
  PONG = "actionPong",
  HU = "actionHu",
}

export interface GameRequest {
  type: GameRequestType;
  data?: unknown;
}

export interface GameResponse {
  type: GameRequestType;
  status: "success" | "error";
  message?: string;
  data?: unknown;
}

export interface SignInRequest extends GameRequest {
  type: GameRequestType.SIGN_IN;
  data: {
    email: string;
    password: string;
  };
}

export interface SignInResponse extends GameResponse {
  type: GameRequestType.SIGN_IN;
  data: UserModel;
}

export interface SignOutRequest extends GameRequest {
  type: GameRequestType.SIGN_OUT;
}

export interface SignOutResponse extends GameResponse {
  type: GameRequestType.SIGN_OUT;
}

export interface ListClientRequest extends GameRequest {
  type: GameRequestType.LIST_CLIENT;
}

export interface ListClientResponse extends GameResponse {
  type: GameRequestType.LIST_CLIENT;
  data: ClientModel[];
}

export interface ListUserRequest extends GameRequest {
  type: GameRequestType.LIST_USER;
}

export interface ListUserResponse extends GameResponse {
  type: GameRequestType.LIST_USER;
  data: UserModel[];
}

export interface DeleteUserRequest extends GameRequest {
  type: GameRequestType.DELETE_USER;
  data: {
    name: string;
  };
}

export interface DeleteUserResponse extends GameResponse {
  type: GameRequestType.DELETE_USER;
}

export interface CreateRoomRequest extends GameRequest {
  type: GameRequestType.CREATE_ROOM;
  data: RoomCreateDto;
}

export interface CreateRoomResponse extends GameResponse {
  type: GameRequestType.CREATE_ROOM;
  data: RoomModel;
}

export interface DeleteRoomRequest extends GameRequest {
  type: GameRequestType.DELETE_ROOM;
  data: {
    name: string;
  };
}

export interface DeleteRoomResponse extends GameResponse {
  type: GameRequestType.DELETE_ROOM;
}

export interface ListRoomRequest extends GameRequest {
  type: GameRequestType.LIST_ROOM;
}

export interface ListRoomResponse extends GameResponse {
  type: GameRequestType.LIST_ROOM;
  data: RoomModel[];
}

export interface JoinRoomRequest extends GameRequest {
  type: GameRequestType.JOIN_ROOM;
  data: {
    roomName: string;
    position: Position;
  };
}

export interface JoinRoomResponse extends GameResponse {
  type: GameRequestType.JOIN_ROOM;
  data: RoomModel;
}

export interface LeaveRoomRequest extends GameRequest {
  type: GameRequestType.LEAVE_ROOM;
  data: {
    roomName: string;
  };
}

export interface LeaveRoomResponse extends GameResponse {
  type: GameRequestType.LEAVE_ROOM;
}

export interface StartGameRequest extends GameRequest {
  type: GameRequestType.START_GAME;
  data: {
    roomName: string;
  };
}

export interface StartGameResponse extends GameResponse {
  type: GameRequestType.START_GAME;
  data: Game;
}

export interface resetGameRequest extends GameRequest {
  type: GameRequestType.RESET_GAME;
}

export interface resetGameResponse extends GameResponse {
  type: GameRequestType.RESET_GAME;
  data: Game;
}

export interface GameActionRequest extends GameRequest {
  type: GameRequestType.DROP_TILE;
  data: {
    tile: TileId;
  };
}

export interface GameActionResponse extends GameResponse {
  type: GameRequestType.DROP_TILE;
  data: Game;
}

export enum GameEventType {
  GAME_UPDATED = "gameUpdated",
}

export interface GameEvent {
  type: GameEventType;
  data: {
    clients: ClientModel[];
    rooms: RoomModel[];
  };
}

export class ClientApi {
  constructor(public gameSocket: GameSocket) {}

  /**
   * auth APIs
   */

  protected async sendSignInRequest(
    request: SignInRequest,
  ): Promise<SignInResponse> {
    return this.gameSocket.sendAndWait<SignInResponse>(request);
  }

  protected async sendSignOutRequest(
    request: SignOutRequest,
  ): Promise<SignOutResponse> {
    return this.gameSocket.sendAndWait<SignOutResponse>(request);
  }

  /**
   * client APIs
   */
  protected async sendListClientRequest(
    request: ListClientRequest,
  ): Promise<ListClientResponse> {
    return this.gameSocket.sendAndWait<ListClientResponse>(request);
  }

  /**
   * user APIs
   */
  protected async sendListUserRequest(
    request: ListUserRequest,
  ): Promise<ListUserResponse> {
    return this.gameSocket.sendAndWait<ListUserResponse>(request);
  }

  protected async sendDeleteUserRequest(
    request: DeleteUserRequest,
  ): Promise<DeleteUserResponse> {
    return this.gameSocket.sendAndWait<DeleteUserResponse>(request);
  }

  /**
   * room APIs
   */
  protected async sendCreateRoomRequest(
    request: CreateRoomRequest,
  ): Promise<CreateRoomResponse> {
    return this.gameSocket.sendAndWait(request);
  }

  protected async sendDeleteRoomRequest(
    request: DeleteRoomRequest,
  ): Promise<DeleteRoomResponse> {
    return this.gameSocket.sendAndWait<DeleteRoomResponse>(request);
  }

  protected async sendListRoomRequest(
    request: ListRoomRequest,
  ): Promise<ListRoomResponse> {
    return this.gameSocket.sendAndWait<ListRoomResponse>(request);
  }

  protected async sendJoinRoomRequest(
    request: JoinRoomRequest,
  ): Promise<JoinRoomResponse> {
    return this.gameSocket.sendAndWait<JoinRoomResponse>(request);
  }

  protected async sendLeaveRoomRequest(
    request: LeaveRoomRequest,
  ): Promise<LeaveRoomResponse> {
    return this.gameSocket.sendAndWait<LeaveRoomResponse>(request);
  }

  /**
   * game APIs
   */
  protected async sendStartGameRequest(
    request: StartGameRequest,
  ): Promise<StartGameResponse> {
    return this.gameSocket.sendAndWait<StartGameResponse>(request);
  }

  protected async sendResetGameRequest(
    request: resetGameRequest,
  ): Promise<resetGameResponse> {
    return this.gameSocket.sendAndWait<resetGameResponse>(request);
  }

  /**
   * Easy APIs
   */

  /**
   * auth APIs
   */
  async signIn(email: string, password: string): Promise<UserModel> {
    const request: SignInRequest = {
      type: GameRequestType.SIGN_IN,
      data: {
        email,
        password,
      },
    };
    const response = await this.sendSignInRequest(request);
    return response.data;
  }

  async signOut(): Promise<void> {
    const request: SignOutRequest = {
      type: GameRequestType.SIGN_OUT,
    };
    await this.sendSignOutRequest(request);
  }

  /**
   * client APIs
   */
  async listClient(): Promise<ClientModel[]> {
    const request: ListClientRequest = {
      type: GameRequestType.LIST_CLIENT,
    };
    const response = await this.sendListClientRequest(request);
    return response.data;
  }

  /**
   * user APIs
   */
  async listUser(): Promise<UserModel[]> {
    const request: ListUserRequest = {
      type: GameRequestType.LIST_USER,
    };
    const response = await this.sendListUserRequest(request);
    return response.data;
  }

  async deleteUser(name: string): Promise<void> {
    const request: DeleteUserRequest = {
      type: GameRequestType.DELETE_USER,
      data: {
        name,
      },
    };
    await this.sendDeleteUserRequest(request);
  }

  /**
   * room APIs
   */
  async createRoom(roomName: string): Promise<RoomModel> {
    const request: CreateRoomRequest = {
      type: GameRequestType.CREATE_ROOM,
      data: {
        name: roomName,
      },
    };
    const response = await this.sendCreateRoomRequest(request);
    return response.data;
  }

  async deleteRoom(roomName: string): Promise<void> {
    const request: DeleteRoomRequest = {
      type: GameRequestType.DELETE_ROOM,
      data: {
        name: roomName,
      },
    };
    await this.sendDeleteRoomRequest(request);
  }

  async listRoom(): Promise<RoomModel[]> {
    const request: ListRoomRequest = {
      type: GameRequestType.LIST_ROOM,
    };
    const response = await this.sendListRoomRequest(request);
    return response.data;
  }

  async joinRoom(roomName: string, position: Position): Promise<RoomModel> {
    const request: JoinRoomRequest = {
      type: GameRequestType.JOIN_ROOM,
      data: {
        roomName,
        position,
      },
    };
    const response = await this.sendJoinRoomRequest(request);
    return response.data;
  }

  async leaveRoom(roomName: string): Promise<void> {
    const request: LeaveRoomRequest = {
      type: GameRequestType.LEAVE_ROOM,
      data: {
        roomName,
      },
    };
    await this.sendLeaveRoomRequest(request);
  }

  /**
   * game APIs
   */
  async startGame(roomName: string): Promise<Game> {
    const request: StartGameRequest = {
      type: GameRequestType.START_GAME,
      data: {
        roomName,
      },
    };
    const response = await this.sendStartGameRequest(request);
    return response.data;
  }
}
