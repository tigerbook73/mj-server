import { Injectable } from "@nestjs/common";
import { MjGameModel } from "src/common/models/mj.game.model";
import { RoomModel } from "src/common/models/room.model";
// import { Socket } from "socket.io-client";
// import { GameRequest, GameResponse } from "src/common/protocols/apis.models";

@Injectable()
export class MjGameService {
  constructor() {
    //
  }

  startGame(room: RoomModel): MjGameModel {
    room.players.forEach(() => {});

    return new MjGameModel();
  }
}
