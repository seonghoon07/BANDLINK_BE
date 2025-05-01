import {
  Body,
  Controller,
  Get, Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePerformanceDto } from '@/src/domain/performances/dto/createPerformance.dto';

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

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getPerformanceDetail(@Param('id') performanceId: number) {
    return this.performanceService.getPerformanceDetail(performanceId);
  }
}
