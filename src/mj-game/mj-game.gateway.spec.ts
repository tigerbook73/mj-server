import { Test, TestingModule } from '@nestjs/testing';
import { MjGameGateway } from './mj-game.gateway';

describe('MjGameGateway', () => {
  let gateway: MjGameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MjGameGateway],
    }).compile();

    gateway = module.get<MjGameGateway>(MjGameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
