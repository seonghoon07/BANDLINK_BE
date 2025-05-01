import { Controller } from '@nestjs/common';
import { PerformanceReservationService } from './performanceReservation.service'

@Controller('performanceReservation')
export class ReservationController {
  constructor(
    private readonly reservationService: PerformanceReservationService,
  ) {}
}
