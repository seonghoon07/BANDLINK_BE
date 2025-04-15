import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './rooms.controller';
import { RoomsService } from './rooms.service';

describe('RoomController', () => {
  let controller: RoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [RoomsService],
    }).compile();

    controller = module.get<RoomController>(RoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
