import { Module } from '@nestjs/common';
import { MjGameGateway } from './mj-game.gateway';

@Module({
  providers: [MjGameGateway],
})
export class MjGameModule {}
