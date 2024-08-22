import { Module } from "@nestjs/common";
import { MjGameGateway } from "./mj-game.gateway";
import { MjGameService } from "./mj-game.service";

@Module({
  providers: [MjGameGateway, MjGameService],
})
export class MjGameModule {}
