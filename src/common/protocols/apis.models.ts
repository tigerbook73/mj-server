import { Game, Player, Position } from "../core/mj.game";
import { type TileId } from "../core/mj.tile-core";
import { ClientModel } from "../models/client.model";
import { PlayerModel } from "../models/player.model";
import { RoomCreateDto, RoomModel } from "../models/room.model";
import { UserModel } from "../models/user.model";
import { GameSocket } from "./game-socket";

export const enum GameRequestType {
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
  ACTION_DROP = "actionDrop",
  ACTION_ANGANG = "actionAngang",
  ACTION_ZIMO = "actionZimo",
  ACTION_PASS = "actionPass",
  ACTION_CHI = "actionChi",
  ACTION_PENG = "actionPeng",
  ACTION_GANG = "actionGang",
  ACTION_HU = "actionHu",
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
  data: RoomModel;
}

export interface EnterGameRequest extends GameRequest {
  type: GameRequestType.ENTER_GAME;
  data: {
    roomName: string;
  };
}

export interface EnterGameResponse extends GameResponse {
  type: GameRequestType.ENTER_GAME;
  data: RoomModel;
}

export interface QuitGameRequest extends GameRequest {
  type: GameRequestType.QUIT_GAME;
  data: {
    roomName: string;
  };
}

export interface QuitGameResponse extends GameResponse {
  type: GameRequestType.QUIT_GAME;
  data: RoomModel;
}

export interface StartGameRequest extends GameRequest {
  type: GameRequestType.START_GAME;
}

export interface StartGameResponse extends GameResponse {
  type: GameRequestType.START_GAME;
  data: Game;
}

export interface ResetGameRequest extends GameRequest {
  type: GameRequestType.RESET_GAME;
}

export interface ResetGameResponse extends GameResponse {
  type: GameRequestType.RESET_GAME;
  data: Game;
}

export interface ActionDropRequest extends GameRequest {
  type: GameRequestType.ACTION_DROP;
  data: {
    tileId: TileId;
  };
}

export interface ActionDropResponse extends GameResponse {
  type: GameRequestType.ACTION_DROP;
  data: Game;
}

export interface ActionAngangRequest extends GameRequest {
  type: GameRequestType.ACTION_ANGANG;
  data: {
    tileIds: [TileId, TileId, TileId, TileId];
  };
}

export interface ActionAngangResponse extends GameResponse {
  type: GameRequestType.ACTION_ANGANG;
  data: Game;
}

export interface ActionZimoRequest extends GameRequest {
  type: GameRequestType.ACTION_ZIMO;
}

export interface ActionZimoResponse extends GameResponse {
  type: GameRequestType.ACTION_ZIMO;
  data: Game;
}

export interface ActionPassRequest extends GameRequest {
  type: GameRequestType.ACTION_PASS;
}

export interface ActionPassResponse extends GameResponse {
  type: GameRequestType.ACTION_PASS;
  data: Game;
}

export interface ActionChiRequest extends GameRequest {
  type: GameRequestType.ACTION_CHI;
  data: {
    tileIds: [TileId, TileId];
  };
}

export interface ActionChiResponse extends GameResponse {
  type: GameRequestType.ACTION_CHI;
  data: Game;
}

export interface ActionPengRequest extends GameRequest {
  type: GameRequestType.ACTION_PENG;
  data: {
    tileIds: [TileId, TileId];
  };
}

export interface ActionPengResponse extends GameResponse {
  type: GameRequestType.ACTION_PENG;
  data: Game;
}

export interface ActionGangRequest extends GameRequest {
  type: GameRequestType.ACTION_GANG;
  data: {
    tileIds: [TileId, TileId, TileId];
  };
}

export interface ActionGangResponse extends GameResponse {
  type: GameRequestType.ACTION_GANG;
  data: Game;
}

export interface ActionHuRequest extends GameRequest {
  type: GameRequestType.ACTION_HU;
}

export interface ActionHuResponse extends GameResponse {
  type: GameRequestType.ACTION_HU;
  data: Game;
}

export const enum GameEventType {
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

  protected async sendRequest<
    REQ extends GameRequest,
    RES extends GameResponse,
  >(request: REQ): Promise<RES> {
    const response = await this.gameSocket.sendAndWait<RES>(request);
    if (response.status === "error") {
      throw new Error(response.message);
    }
    return response;
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
    const response = await this.sendRequest<SignInRequest, SignInResponse>(
      request,
    );
    return UserModel.fromJSON(response.data);
  }

  async signOut(): Promise<void> {
    const request: SignOutRequest = {
      type: GameRequestType.SIGN_OUT,
    };
    await this.sendRequest<SignOutRequest, SignOutResponse>(request);
  }

  /**
   * client APIs
   */
  async listClient(): Promise<ClientModel[]> {
    const request: ListClientRequest = {
      type: GameRequestType.LIST_CLIENT,
    };
    const response = await this.sendRequest<
      ListClientRequest,
      ListClientResponse
    >(request);
    return response.data.map((data) => ClientModel.fromJSON(data));
  }

  /**
   * user APIs
   */
  async listUser(): Promise<UserModel[]> {
    const request: ListUserRequest = {
      type: GameRequestType.LIST_USER,
    };
    const response = await this.sendRequest<ListUserRequest, ListUserResponse>(
      request,
    );
    return response.data.map((data) => UserModel.fromJSON(data));
  }

  async deleteUser(name: string): Promise<void> {
    const request: DeleteUserRequest = {
      type: GameRequestType.DELETE_USER,
      data: {
        name,
      },
    };
    await this.sendRequest<DeleteUserRequest, DeleteUserResponse>(request);
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
    const response = await this.sendRequest<
      CreateRoomRequest,
      CreateRoomResponse
    >(request);
    return RoomModel.fromJSON(response.data);
  }

  async deleteRoom(roomName: string): Promise<void> {
    const request: DeleteRoomRequest = {
      type: GameRequestType.DELETE_ROOM,
      data: {
        name: roomName,
      },
    };
    await this.sendRequest<DeleteRoomRequest, DeleteRoomResponse>(request);
  }

  async listRoom(): Promise<RoomModel[]> {
    const request: ListRoomRequest = {
      type: GameRequestType.LIST_ROOM,
    };
    const response = await this.sendRequest<ListRoomRequest, ListRoomResponse>(
      request,
    );
    return response.data.map((data) => RoomModel.fromJSON(data));
  }

  async joinRoom(roomName: string, position: Position): Promise<RoomModel> {
    const request: JoinRoomRequest = {
      type: GameRequestType.JOIN_ROOM,
      data: {
        roomName,
        position,
      },
    };
    const response = await this.sendRequest<JoinRoomRequest, JoinRoomResponse>(
      request,
    );
    return RoomModel.fromJSON(response.data);
  }

  async leaveRoom(roomName: string): Promise<void> {
    const request: LeaveRoomRequest = {
      type: GameRequestType.LEAVE_ROOM,
      data: {
        roomName,
      },
    };
    await this.sendRequest<LeaveRoomRequest, LeaveRoomResponse>(request);
  }

  async enterGame(roomName: string): Promise<RoomModel> {
    const request: EnterGameRequest = {
      type: GameRequestType.ENTER_GAME,
      data: {
        roomName,
      },
    };
    const response = await this.sendRequest<
      EnterGameRequest,
      EnterGameResponse
    >(request);
    return RoomModel.fromJSON(response.data);
  }

  async quitGame(roomName: string): Promise<RoomModel> {
    const request: QuitGameRequest = {
      type: GameRequestType.QUIT_GAME,
      data: {
        roomName,
      },
    };
    const response = await this.sendRequest<QuitGameRequest, QuitGameResponse>(
      request,
    );
    return RoomModel.fromJSON(response.data);
  }

  /**
   * game APIs
   */
  async startGame(): Promise<Game> {
    const request: StartGameRequest = {
      type: GameRequestType.START_GAME,
    };
    const response = await this.sendRequest<
      StartGameRequest,
      StartGameResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async resetGame(): Promise<Game> {
    const request: ResetGameRequest = {
      type: GameRequestType.RESET_GAME,
    };
    const response = await this.sendRequest<
      ResetGameRequest,
      ResetGameResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionDrop(tileId: TileId): Promise<Game> {
    const request: ActionDropRequest = {
      type: GameRequestType.ACTION_DROP,
      data: {
        tileId,
      },
    };
    const response = await this.sendRequest<
      ActionDropRequest,
      ActionDropResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionAngang(tileIds: [TileId, TileId, TileId, TileId]): Promise<Game> {
    const request: ActionAngangRequest = {
      type: GameRequestType.ACTION_ANGANG,
      data: {
        tileIds,
      },
    };
    const response = await this.sendRequest<
      ActionAngangRequest,
      ActionAngangResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionZimo(): Promise<Game> {
    const request: ActionZimoRequest = {
      type: GameRequestType.ACTION_ZIMO,
    };
    const response = await this.sendRequest<
      ActionZimoRequest,
      ActionZimoResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionPass(): Promise<Game> {
    const request: ActionPassRequest = {
      type: GameRequestType.ACTION_PASS,
    };
    const response = await this.sendRequest<
      ActionPassRequest,
      ActionPassResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionChi(tileIds: [TileId, TileId]): Promise<Game> {
    const request: ActionChiRequest = {
      type: GameRequestType.ACTION_CHI,
      data: {
        tileIds,
      },
    };
    const response = await this.sendRequest<
      ActionChiRequest,
      ActionChiResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionPeng(tileIds: [TileId, TileId]): Promise<Game> {
    const request: ActionPengRequest = {
      type: GameRequestType.ACTION_PENG,
      data: {
        tileIds,
      },
    };
    const response = await this.sendRequest<
      ActionPengRequest,
      ActionPengResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionGang(tileIds: [TileId, TileId, TileId]): Promise<Game> {
    const request: ActionGangRequest = {
      type: GameRequestType.ACTION_GANG,
      data: {
        tileIds,
      },
    };
    const response = await this.sendRequest<
      ActionGangRequest,
      ActionGangResponse
    >(request);
    return Game.fromJSON(response.data);
  }

  async actionHu(): Promise<Game> {
    const request: ActionHuRequest = {
      type: GameRequestType.ACTION_HU,
    };
    const response = await this.sendRequest<ActionHuRequest, ActionHuResponse>(
      request,
    );
    return Game.fromJSON(response.data);
  }

  /**
   * event parser
   */
  parseEvent(event: any): GameEvent {
    return {
      type: event.type,
      data: {
        clients: event.data.clients.map((data: any) =>
          ClientModel.fromJSON(data),
        ),
        rooms: event.data.rooms.map((data: any) => RoomModel.fromJSON(data)),
      },
    };
  }

  findMyClient(event: GameEvent): ClientModel | null {
    const socket = this.gameSocket.socket;
    if (!socket) {
      return null;
    }

    if (!socket.connected) {
      return null;
    }

    return event.data.clients.find((client) => client.id === socket.id) || null;
  }

  findMyUser(event: GameEvent): UserModel | null {
    const client = this.findMyClient(event);
    if (!client) {
      return null;
    }

    return client.user;
  }

  findMyRoom(event: GameEvent): RoomModel | null {
    const user = this.findMyUser(event);
    if (!user) {
      return null;
    }

    return (
      event.data.rooms.find((room) =>
        room.players.find((player) => player.userName === user.name),
      ) || null
    );
  }

  findMyPlayerModel(event: GameEvent): PlayerModel | null {
    const user = this.findMyUser(event);
    if (!user) {
      return null;
    }

    const room = this.findMyRoom(event);
    if (!room) {
      return null;
    }

    return room.players.find((player) => player.userName === user.name) || null;
  }

  findMyGame(event: GameEvent): Game | null {
    const room = this.findMyRoom(event);
    if (!room) {
      return null;
    }

    return room.game;
  }

  findMyPlayer(event: GameEvent): Player | null {
    const game = this.findMyGame(event);
    if (!game) {
      return null;
    }

    const playerModel = this.findMyPlayerModel(event);
    if (!playerModel) {
      return null;
    }

    return (
      game.players.find(
        (player) => player?.position === playerModel.position,
      ) || null
    );
  }
}
