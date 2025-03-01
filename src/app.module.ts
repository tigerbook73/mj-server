import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MjGameModule } from "./game/mj-game.module";

@Module({
  imports: [MjGameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
