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

@Controller('performances')
export class PerformanceController {
  constructor(
    private readonly performanceService: PerformanceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
