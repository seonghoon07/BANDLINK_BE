import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '@/src/places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
