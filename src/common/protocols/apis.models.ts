import { ClientModel } from "../models/client.model";
import { PlayerPosition } from "../models/common.types";
import { MjGameModel } from "../models/mj.game.model";
import { RoomCreateDto, RoomModel } from "../models/room.model";
import { UserModel } from "../models/user.model";

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

  // games
  START_GAME = "startGame",
  RESET_GAME = "resetGame",

  // MJ game
  PICK_TILE = "pickTile",
  DISCARD_TILE = "discardTile",
  PASS_TILE = "passTile",
  CHI_TILE = "chiTile",
  PONG_TILE = "pongTile",
  KONG_TILE = "kongTile",
  WIN_GAME = "winGame",
}

export interface GameRequest {
  type: GameRequestType;
  data?: unknown;
}

export interface GameResponse {
  type: string;
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
    position: PlayerPosition;
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
  data: MjGameModel;
}

export interface resetGameRequest extends GameRequest {
  type: GameRequestType.RESET_GAME;
}

export interface resetGameResponse extends GameResponse {
  type: GameRequestType.RESET_GAME;
  data: MjGameModel;
}

export interface PickTileRequest extends GameRequest {
  type: GameRequestType.PICK_TILE;
}

export interface PickTileResponse extends GameResponse {
  type: GameRequestType.PICK_TILE;
  data: MjGameModel;
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
