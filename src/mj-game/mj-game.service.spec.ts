import { Test, TestingModule } from "@nestjs/testing";
import { MjGameService } from "./mj-game.service";

describe("MjGameService", () => {
  let service: MjGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MjGameService],
    }).compile();

    service = module.get<MjGameService>(MjGameService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
