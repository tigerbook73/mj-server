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
  ActionAnGangRequest,
  ActionAnGangResponse,
  ActionChiRequest,
  ActionChiResponse,
  ActionDropRequest,
  ActionDropResponse,
  ActionHuZhimoRequest,
  ActionHuZhimoResponse,
  ActionPassRequest,
  ActionPassResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  DeleteRoomRequest,
  DeleteRoomResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  EnterGameRequest,
  EnterGameResponse,
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
  QuitGameRequest,
  QuitGameResponse,
  ResetGameRequest,
  ResetGameResponse,
  SignInRequest,
  SignInResponse,
  SignOutRequest,
  SignOutResponse,
  StartGameRequest,
  StartGameResponse,
  ActionPengRequest,
  ActionPengResponse,
  ActionGangRequest,
  ActionGangResponse,
  ActionHuRequest,
  ActionHuResponse,
} from "src/common/protocols/apis.models";
import { ClientService } from "./client.service";
import { UserService } from "./user.service";
import { RoomService } from "./room.service";
import { GameService } from "./game.service";
import { AuthService } from "./auth.service";
import { ClientModel } from "src/common/models/client.model";
import { Game, Player } from "src/common/core/mj.game";

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

  private messageHandlers: Map<string, RequestHandler>;

  constructor(
    public clientService: ClientService,
    public authService: AuthService,
    public userService: UserService,
    public roomService: RoomService,
    public gameService: GameService,
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
      [
        GameRequestType.ENTER_GAME,
        { update: true, handler: this.handleEnterGameRequest },
      ],
      [
        GameRequestType.QUIT_GAME,
        { update: true, handler: this.handleQuitGameRequest },
      ],

      // games
      [
        GameRequestType.START_GAME,
        { update: true, handler: this.handleStartGameRequest },
      ],
      [
        GameRequestType.RESET_GAME,
        { update: true, handler: this.handleResetGameRequest },
      ],
      [
        GameRequestType.ACTION_DROP,
        { update: true, handler: this.handleActionDropRequest },
      ],
      [
        GameRequestType.ACTION_ANGANG,
        { update: true, handler: this.handleActionAnGangRequest },
      ],
      [
        GameRequestType.ACTION_HUZHIMO,
        { update: true, handler: this.handleActionHuzimoRequest },
      ],
      [
        GameRequestType.ACTION_PASS,
        { update: true, handler: this.handleActionPassRequest },
      ],
      [
        GameRequestType.ACTION_CHI,
        { update: true, handler: this.handleActionChiRequest },
      ],
      [
        GameRequestType.ACTION_PENG,
        { update: true, handler: this.handleActionPengRequest },
      ],
      [
        GameRequestType.ACTION_GANG,
        { update: true, handler: this.handleActionGangRequest },
      ],
      [
        GameRequestType.ACTION_HU,
        { update: true, handler: this.handleActionHuRequest },
      ],
    ]);
  }

  afterInit() {
    this.logger.log("Initialized!");
  }

  handleConnection(client: Socket) {
    const clientModel = this.clientService.create({
      id: client.id,
      socket: client.id,
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
      this.authService.signOut(clientModel);
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

  handleEnterGameRequest(
    request: EnterGameRequest,
    client: ClientModel,
  ): EnterGameResponse {
    const room = this.roomService.find(request.data.roomName);
    if (!room) {
      throw new Error(`Room ${request.data.roomName} not found.`);
    }

    const user = room.players.find(
      (player) => player.userName === client.user?.name,
    );
    if (!user) {
      throw new Error(`User not in room cannot enter game.`);
    }

    this.roomService.enterGame(room);
    return {
      type: request.type,
      status: "success",
      data: room,
    };
  }

  handleQuitGameRequest(
    request: QuitGameRequest,
    client: ClientModel,
  ): QuitGameResponse {
    const room = this.roomService.find(request.data.roomName);
    if (!room) {
      throw new Error(`Room ${request.data.roomName} not found.`);
    }

    const user = room.players.find(
      (player) => player.userName === client.user?.name,
    );
    if (!user) {
      throw new Error("User not in room cannot quit game.");
    }

    this.roomService.quitGame(room);
    return {
      type: request.type,
      status: "success",
      data: room,
    };
  }

  handleStartGameRequest(
    request: StartGameRequest,
    client: ClientModel,
  ): StartGameResponse {
    if (!client.user) {
      throw new Error("User not logged in.");
    }

    const { game, player } = this.validateGamePlayer(client);

    this.gameService.startGame(player, game);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleResetGameRequest(
    request: ResetGameRequest,
    client: ClientModel,
  ): ResetGameResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.resetGame(player, game);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionDropRequest(
    request: ActionDropRequest,
    client: ClientModel,
  ): ActionDropResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionDrop(player, game, request.data.tileId);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionAnGangRequest(
    request: ActionAnGangRequest,
    client: ClientModel,
  ): ActionAnGangResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionAnGang(player, game, request.data.tileIds);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionHuzimoRequest(
    request: ActionHuZhimoRequest,
    client: ClientModel,
  ): ActionHuZhimoResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionHuzimo(player, game);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionPassRequest(
    request: ActionPassRequest,
    client: ClientModel,
  ): ActionPassResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionPass(player, game);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionChiRequest(
    request: ActionChiRequest,
    client: ClientModel,
  ): ActionChiResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionChi(player, game, request.data.tileIds);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionPengRequest(
    request: ActionPengRequest,
    client: ClientModel,
  ): ActionPengResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionPeng(player, game, request.data.tileIds);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionGangRequest(
    request: ActionGangRequest,
    client: ClientModel,
  ): ActionGangResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionGong(player, game, request.data.tileIds);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  handleActionHuRequest(
    request: ActionHuRequest,
    client: ClientModel,
  ): ActionHuResponse {
    const { game, player } = this.validateGamePlayer(client);

    this.gameService.actionHu(player, game);
    return {
      type: request.type,
      status: "success",
      data: game,
    };
  }

  validateGamePlayer(client: ClientModel): { game: Game; player: Player } {
    if (!client.user) {
      throw new Error("User not logged in.");
    }

    const room = this.roomService.findByUser(client.user);
    if (!room) {
      throw new Error("User not in room.");
    }

    if (!room.game) {
      throw new Error("Game not init.");
    }

    const player = room.players.find(
      (player) => player.userName === client.user?.name,
    );
    if (!player) {
      throw new Error("Player not in the game.");
    }

    const gamePlayer = room.game.players.find(
      (gamePlayer) => gamePlayer?.position === player.position,
    );
    if (!gamePlayer) {
      throw new Error("Player position not found in game.");
    }

    return { game: room.game, player: gamePlayer };
  }
}
