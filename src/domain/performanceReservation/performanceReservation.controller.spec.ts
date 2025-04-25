import { Test, TestingModule } from '@nestjs/testing';
import { ReservationController } from './performanceReservation.controller';
import { PerformanceReservationService } from './performanceReservation.service';

describe('ReservationController', () => {
  let controller: ReservationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [PerformanceReservationService],
    }).compile();

    controller = module.get<ReservationController>(ReservationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
