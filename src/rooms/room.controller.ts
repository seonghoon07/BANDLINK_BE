import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRoomDetail(@Param('id') roomId: number): Promise<any> {
    return this.roomService.getRoomDetail(roomId);
  }

  @Get(':id/unavailableDates')
  @UseGuards(JwtAuthGuard)
  async getUnavailableDates(
    @Param('id') roomId: number,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.roomService.getUnavailableDates(
      roomId,
      Number(year),
      Number(month),
    );
  }
}
