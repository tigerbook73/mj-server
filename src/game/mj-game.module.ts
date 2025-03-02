import { Module } from "@nestjs/common";
import { MjGameGateway } from "./mj-game.gateway";
import { GameService } from "./game.service";
import { AuthService } from "./auth.service";
import { ClientService } from "./client.service";
import { UserService } from "./user.service";
import { RoomService } from "./room.service";

@Module({
  providers: [
    MjGameGateway,
    GameService,
    AuthService,
    ClientService,
    UserService,
    RoomService,
  ],
})
export class MjGameModule {}
