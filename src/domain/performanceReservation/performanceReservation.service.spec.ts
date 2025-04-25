import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceReservationService } from './performanceReservation.service';

describe('ReservationService', () => {
  let service: PerformanceReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerformanceReservationService],
    }).compile();

    service = module.get<PerformanceReservationService>(PerformanceReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
