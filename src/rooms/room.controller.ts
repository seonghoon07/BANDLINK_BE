import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ReserveRoomRequestDto } from '@/src/rooms/dto/reserveRoomRequest.dto';

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

  @Post(':id/reserve')
  @UseGuards(JwtAuthGuard)
  async reserveRoom(
    @Param('id') roomId: number,
    @Body() body: ReserveRoomRequestDto,
    @Req() req: Request,
  ): Promise<void> {
    const userId = (req.user as { id: number }).id;

    await this.roomService.reserveRoom({
      roomId,
      userId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      price: body.price,
    });
  }

  @Get(':id/unavailableHours')
  @UseGuards(JwtAuthGuard)
  async getUnavailableHours(
    @Param('id') roomId: number,
    @Query('date') date: string,
  ): Promise<{ am: number[]; pm: number[] }> {
    return this.roomService.getUnavailableHours(roomId, date);
  }
}
