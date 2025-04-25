import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { RoomReservationService } from '@/src/roomReservation/roomReservation.service';

@Controller('roomReservation')
export class RoomReservationController {
  constructor(
    private readonly roomReservationService: RoomReservationService,
  ) {}

  @Get('/revenue')
  @UseGuards(JwtAuthGuard)
  async getRevenue(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.roomReservationService.getRevenue(googleUid);
  }
}
