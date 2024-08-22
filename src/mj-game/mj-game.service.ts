import { Injectable } from '@nestjs/common';

class Client {
  id: string;
}

class Game {
  name: string;
  clients: Client;
  mjGame: any;
}

@Injectable()
export class MjGameService {
  constructor() {
    //
  }

  public handleListGames(data: GameRequest, client: Socket): GameResponse {
    return {
      type: 'listGames',
      status: 'success',
      data: {
        games: [],
      },
    };
  }

  public handleJoinGame(data: GameRequest, client: Socket): GameResponse {
    const player = this.clients.get(client.id);
    if (player) {
      return {
        type: 'joinGame',
        status: 'error',
        message: 'You are already in a game',
      };
    }

    const position = data.data?.position || 'random';
    const gamePlayer: GamePlayer = {
      game: 'default',
      state: 'waiting',
      position,
      player: data.data?.player || client.id,
    };

    this.clients.set(client.id, gamePlayer);

    return {
      type: 'joinGame',
      status: 'success',
      data: {
        player: gamePlayer,
        game: {},
      },
    };
  }
}
