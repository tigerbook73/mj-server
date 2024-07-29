import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface GamePlayer {
  game: 'default';
  state: 'waiting' | 'playing' | 'paused' | 'finished';
  position: 'south' | 'west' | 'north' | 'east' | 'random' | 'observer';
  player: string;
}

interface GameRequest {
  type: string;
  data?: {
    game?: 'default';
    position?: 'south' | 'west' | 'north' | 'east' | 'random' | 'observer';
    player?: string;
  };
}

interface GameResponse {
  type: string;
  status: 'success' | 'error';
  message?: string;
  data?: {
    player: GamePlayer;
    game: Record<string, any>;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MjGameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MjGameGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  private clients: Map<string, GamePlayer> = new Map([]);

  private messageHandlers: Map<
    string,
    (data: GameRequest, client?: Socket) => GameResponse
  > = new Map([
    ['joinGame', this.handleJoinGame],
    ['leaveGame', this.handleLeaveGame],
    ['resetGame', this.handleResetGame],
    ['startGame', this.handleStartGame],
  ]);

  afterInit() {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Client connected: ${client.id}`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: Socket) {
    const { sockets } = this.server.sockets;

    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  @SubscribeMessage('mj:game')
  handleMessage(
    @MessageBody() data: GameRequest,
    @ConnectedSocket() client: Socket,
  ): void {
    const handler = this.messageHandlers.get(data.type);
    if (!handler) {
      client.emit('mj:game', {
        type: data.type,
        status: 'error',
        message: `Handler for data.type: ${data.type} not found`,
      });
      return;
    }

    const response = handler.call(this, data, client);

    client.emit('mj:game', response);

    this.server.emit('mj:game', {
      type: 'gameInfo',
      data: {
        game: response.data.game,
      },
    });
  }

  handleJoinGame(request: GameRequest, client?: Socket): GameResponse {
    const existPlayer = this.clients.get(client.id);
    if (existPlayer) {
      return {
        type: 'joinGame',
        status: 'error',
        message: 'Already joined a game',
      };
    }

    const player = {
      game: request.data.game,
      state: 'waiting',
      position: request.data.position,
      player: request.data.player,
    } as GamePlayer;
    this.clients.set(client.id, player);

    return {
      type: 'joinGame',
      status: 'success',
      data: {
        player,
        game: {},
      },
    };
  }

  handleLeaveGame(request: GameRequest): GameResponse {
    return {
      type: 'leaveGame',
      status: 'success',
      data: {
        player: {
          game: request.data.game,
          state: null,
          position: null,
          player: request.data.player,
        },
        game: {},
      },
    };
  }

  handleResetGame(request: GameRequest): GameResponse {
    return {
      type: 'resetGame',
      status: 'success',
      data: {
        player: {
          game: request.data.game,
          state: 'waiting',
          position: request.data.position,
          player: request.data.player,
        },
        game: {},
      },
    };
  }

  handleStartGame(request: GameRequest): GameResponse {
    return {
      type: 'startGame',
      status: 'success',
      data: {
        player: {
          game: request.data.game,
          state: 'playing',
          position: request.data.position,
          player: request.data.player,
        },
        game: {},
      },
    };
  }
}
