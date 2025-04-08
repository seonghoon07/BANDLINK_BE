import { Module } from '@nestjs/common';
import { PerformanceReservationService } from './performanceReservation.service';
import { ReservationController } from './performanceReservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceReservation } from '@/src/performanceReservation/entities/performanceReservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceReservation])],
  controllers: [ReservationController],
  providers: [PerformanceReservationService],
})
export class PerformanceReservationModule {}
