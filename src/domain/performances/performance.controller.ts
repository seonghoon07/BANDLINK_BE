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
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePerformanceDto } from '@/src/domain/performances/dto/createPerformance.dto';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { ReservedRoomDto } from '@/src/domain/performances/dto/reservedRoom.dto';

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
  async getMyReservedRooms(@Req() req: Request): Promise<any> {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.getMyReservedRooms(googleUid);
  }
}
