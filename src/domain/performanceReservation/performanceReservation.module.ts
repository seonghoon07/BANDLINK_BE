import { Module } from '@nestjs/common';
import { PerformanceReservationService } from './performanceReservation.service';
import { ReservationController } from './performanceReservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceReservation } from '@/src/domain/performanceReservation/entities/performanceReservation.entity';
import { User } from '@/src/domain/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceReservation, User])],
  controllers: [ReservationController],
  providers: [PerformanceReservationService],
})
export class PerformanceReservationModule {}
