import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MjGameModule } from "./game/mj-game.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    //
    MjGameModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
