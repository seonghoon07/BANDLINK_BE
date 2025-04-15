import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRoomDetail(@Param('id') roomId: number): Promise<any> {
    return this.roomService.getRoomDetail(roomId);
  }
}
