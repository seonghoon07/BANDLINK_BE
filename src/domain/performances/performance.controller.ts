import {
  Body,
  Controller,
  Get, Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreatePerformanceDto } from '@/src/domain/performances/dto/createPerformance.dto';
import { ReserveRequestDto } from '@/src/domain/performances/dto/reserveRequest.dto';

@Controller('performances')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPerformances() {
    return this.performanceService.getPerformances();
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  async getMyPerformances(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.getMyPerformances(googleUid);
  }

  @Get('/reservedRooms')
  @UseGuards(JwtAuthGuard)
  async getMyReservedRooms(@Req() req: Request): Promise<any> {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.getMyReservedRooms(googleUid);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getPerformanceDetail(@Param('id') performanceId: number) {
    return this.performanceService.getPerformanceDetail(performanceId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPerformance(
    @Body() dto: CreatePerformanceDto,
    @Req() req: Request,
  ) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.createPerformance(dto, googleUid);
  }

  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  async reservePerformance(
    @Body() dto: ReserveRequestDto,
    @Req() req: Request,
  ) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.performanceService.reservePerformance(
      dto.performanceId,
      googleUid,
    );
  }
}
