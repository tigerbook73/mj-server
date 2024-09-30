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
  GameEventType,
  GameRequest,
  GameRequestType,
  GameResponse,
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

type RequestHandler = (data: GameRequest, client?: Socket) => GameResponse;

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
    this.messageHandlers = new Map<string, any>([
      [GameRequestType.SIGN_IN, this.handleSignInRequest],
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
  }

  @SubscribeMessage("mj:game")
  handleMessage(
    @MessageBody() data: GameRequest,
    @ConnectedSocket() client: Socket,
  ): void {
    const clientModel = this.clientService.findById(client.id);
    if (!clientModel) {
      throw new Error("Client not found");
    }

    const handler = this.messageHandlers.get(data.type);
    if (!handler) {
      throw new Error(`Handler not found for ${data.type}`);
    }

    const response = handler.call(this, data, clientModel);

    client.emit("mj:game", response);

    this.server.emit("mj:game", {
      type: GameEventType.GAME_UPDATED,
      data: {
        clients: this.clientService.findAll(),
        rooms: this.roomService.findAll(),
      },
    });
  }

  handleSignInRequest(
    request: SignInRequest,
    client: ClientModel,
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
}
