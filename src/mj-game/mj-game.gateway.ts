import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  CreateRoomRequest,
  CreateRoomResponse,
  DeleteRoomRequest,
  DeleteRoomResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  GameEventType,
  GameRequest,
  GameRequestType,
  GameResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  ListClientRequest,
  ListClientResponse,
  ListRoomRequest,
  ListRoomResponse,
  ListUserRequest,
  ListUserResponse,
  SignInRequest,
  SignInResponse,
  SignOutRequest,
  SignOutResponse,
} from "src/common/protocols/apis.models";
import { ClientService } from "./client.service";
import { UserService } from "./user.service";
import { RoomService } from "./room.service";
import { MjGameService } from "./mj-game.service";
import { AuthService } from "./auth.service";
import { ClientModel } from "src/common/models/client.model";

type RequestHandler = {
  update: boolean;
  handler: (request: GameRequest, client: ClientModel) => GameResponse;
};

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class MjGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  public readonly eventType = "mj:game";

  private readonly logger = new Logger(MjGameGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  /**
   *
   */
  /*
  export enum GameRequestType {
    // Authentication
    SIGN_IN = "signIn",

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
  */

  private messageHandlers: Map<string, RequestHandler>;

  constructor(
    public clientService: ClientService,
    public authService: AuthService,
    public userService: UserService,
    public roomService: RoomService,
    public gameService: MjGameService,
  ) {
    //
    this.messageHandlers = new Map<string, RequestHandler>([
      // Authentication
      [
        GameRequestType.SIGN_IN,
        { update: true, handler: this.handleSignInRequest },
      ],
      [
        GameRequestType.SIGN_OUT,
        { update: true, handler: this.handleSignOutRequest },
      ],

      // clients
      [
        GameRequestType.LIST_CLIENT,
        { update: false, handler: this.handleListClientRequest },
      ],

      // users
      [
        GameRequestType.LIST_USER,
        { update: false, handler: this.handleListUserRequest },
      ],
      [
        GameRequestType.DELETE_USER,
        { update: true, handler: this.handleDeleteUserRequest },
      ],

      // rooms
      [
        GameRequestType.LIST_ROOM,
        { update: false, handler: this.handleListRoomRequest },
      ],
      [
        GameRequestType.CREATE_ROOM,
        { update: true, handler: this.handleCreateRoomRequest },
      ],
      [
        GameRequestType.DELETE_ROOM,
        { update: true, handler: this.handleDeleteRoomRequest },
      ],
      [
        GameRequestType.JOIN_ROOM,
        { update: true, handler: this.handleJoinRoomRequest },
      ],
      [
        GameRequestType.LEAVE_ROOM,
        { update: true, handler: this.handleLeaveRoomRequest },
      ],
    ]);
  }

  afterInit() {
    this.logger.log("Initialized!");
  }

  handleConnection(client: Socket) {
    const clientModel = this.clientService.create({
      id: client.id,
      socket: client,
    });

    this.logger.log(`Client connected: ${client.id}`);

    return clientModel;
  }

  handleDisconnect(client: Socket) {
    const clientModel = this.clientService.findById(client.id);
    if (!clientModel) {
      throw new Error("Client not found");
    }

    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientService.delete(clientModel);

    if (!clientModel.user) {
      return;
    }

    this.roomService.dropUser(clientModel.user);
  }

  @SubscribeMessage("mj:game")
  handleMessage(
    @MessageBody() data: GameRequest,
    @ConnectedSocket() client: Socket,
  ): GameResponse {
    try {
      const clientModel = this.clientService.findById(client.id);
      if (!clientModel) {
        throw new Error("Client not found");
      }

      const handler = this.messageHandlers.get(data.type);
      if (!handler) {
        throw new Error(`Handler not found for ${data.type}`);
      }

      const response = handler.handler.call(this, data, clientModel);

      if (handler.update) {
        this.server.emit("mj:game", {
          type: GameEventType.GAME_UPDATED,
          data: {
            clients: this.clientService.findAll(),
            rooms: this.roomService.findAll(),
          },
        });
      }
      return response;
    } catch (error) {
      const response: GameResponse = {
        type: data.type,
        status: "error",
        message: error.message,
      };
      return response;
    }
  }

  handleSignInRequest(
    request: SignInRequest,
    client?: ClientModel,
  ): SignInResponse {
    const user = this.authService.signIn(request.data, client);
    return {
      type: request.type,
      status: "success",
      data: user,
    };
  }

  handleSignOutRequest(
    request: SignOutRequest,
    client: ClientModel,
  ): SignOutResponse {
    this.authService.signOut(client);
    return {
      type: request.type,
      status: "success",
    };
  }

  handleListClientRequest(request: ListClientRequest): ListClientResponse {
    const clients = this.clientService.findAll();
    return {
      type: request.type,
      status: "success",
      data: clients,
    };
  }

  handleListUserRequest(request: ListUserRequest): ListUserResponse {
    const users = this.userService.findAll();
    return {
      type: request.type,
      status: "success",
      data: users,
    };
  }

  handleDeleteUserRequest(request: DeleteUserRequest): DeleteUserResponse {
    const user = this.userService.find(request.data.name);
    if (!user) {
      throw new Error(`User ${request.data.name} not found.`);
    }

    this.userService.delete(user.name);
    return {
      type: request.type,
      status: "success",
      data: user,
    };
  }

  handleListRoomRequest(request: ListRoomRequest): ListRoomResponse {
    const rooms = this.roomService.findAll();
    return {
      type: request.type,
      status: "success",
      data: rooms,
    };
  }

  handleCreateRoomRequest(request: CreateRoomRequest): CreateRoomResponse {
    const room = this.roomService.create(request.data);
    return {
      type: request.type,
      status: "success",
      data: room,
    };
  }

  handleDeleteRoomRequest(request: DeleteRoomRequest): DeleteRoomResponse {
    const room = this.roomService.find(request.data.name);
    if (!room) {
      throw new Error(`Room ${request.data.name} not found.`);
    }

    this.roomService.delete(room);
    return {
      type: request.type,
      status: "success",
    };
  }

  handleJoinRoomRequest(
    request: JoinRoomRequest,
    client: ClientModel,
  ): JoinRoomResponse {
    const room = this.roomService.find(request.data.roomName);
    if (!room) {
      throw new Error(`Room ${request.data.roomName} not found.`);
    }

    const user = this.clientService.findById(client.id)?.user;
    if (!user) {
      throw new Error(`User not logged in.`);
    }

    this.roomService.joinRoom(user, room, request.data.position);
    return {
      type: request.type,
      status: "success",
      data: room,
    };
  }

  handleLeaveRoomRequest(
    request: JoinRoomRequest,
    client: ClientModel,
  ): JoinRoomResponse {
    const room = this.roomService.find(request.data.roomName);
    if (!room) {
      throw new Error(`Room ${request.data.roomName} not found.`);
    }

    const user = this.clientService.findById(client.id)?.user;
    if (!user) {
      throw new Error(`User not logged in.`);
    }

    this.roomService.leaveRoom(user);
    return {
      type: request.type,
      status: "success",
      data: room,
    };
  }
}
