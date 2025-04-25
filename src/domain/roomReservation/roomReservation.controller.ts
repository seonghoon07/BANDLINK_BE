import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { RoomReservationService } from '@/src/domain/roomReservation/roomReservation.service';

@Controller('roomReservation')
export class RoomReservationController {
  constructor(
    private readonly roomReservationService: RoomReservationService,
  ) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getRoomReservations(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.roomReservationService.getRoomReservations(googleUid);
  }

  @Get('/revenue')
  @UseGuards(JwtAuthGuard)
  async getRevenue(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.roomReservationService.getRevenue(googleUid);
  }
}
