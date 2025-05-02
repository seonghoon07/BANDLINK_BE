import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PerformanceReservationService } from './performanceReservation.service'
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('performanceReservation')
export class ReservationController {
  constructor(
    private readonly performanceReservationService: PerformanceReservationService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPerformanceReservation(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceReservationService.getMyPerformanceReservation(googleUid);
  }
}
