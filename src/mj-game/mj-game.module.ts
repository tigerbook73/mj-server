import { Module } from "@nestjs/common";
import { MjGameGateway } from "./mj-game.gateway";
import { MjGameService } from "./mj-game.service";
import { AuthService } from "./auth.service";
import { ClientService } from "./client.service";
import { UserService } from "./user.service";
import { RoomService } from "./room.service";

@Module({
  providers: [
    MjGameGateway,
    MjGameService,
    AuthService,
    ClientService,
    UserService,
    RoomService,
  ],
})
export class MjGameModule {}
