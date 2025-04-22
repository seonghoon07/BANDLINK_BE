import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePerformanceDto } from '@/src/performances/dto/createPerformance.dto';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';
import { ReservedRoomDto } from '@/src/performances/dto/reservedRoom.dto';

@Controller('performances')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RoomReservation)
    private readonly roomReservationRepository: Repository<RoomReservation>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPerformances(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;

    const user = await this.userRepository.findOne({
      where: { googleUid },
    });

    if (!user) {
      throw new UnauthorizedException('등록되지 않은 사용자입니다.');
    }
    return this.performanceService.getMyPerformances(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('poster'))
  async createPerformance(
    @Body() dto: CreatePerformanceDto,
    @Req() req: Request,
  ) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.createPerformance(dto, googleUid);
  }

  @Get('/reservedRooms')
  @UseGuards(JwtAuthGuard)
  async getMyReservedRooms(@Req() req: Request): Promise<ReservedRoomDto[]> {
    const googleUid = (req.user as { userId: string }).userId;

    const user = await this.userRepository.findOne({
      where: { googleUid },
    });

    if (!user) throw new UnauthorizedException();

    const reservations = await this.roomReservationRepository.find({
      where: { reservedBy: user },
      relations: ['room', 'room.place'],
    });

    return reservations.map((r) => ({
      reservationId: r.id,
      roomName: r.room.name,
      address: r.room.place.address,
      startTime: new Date(r.startDate),
      endTime: new Date(r.endDate),
    }));
  }
}
