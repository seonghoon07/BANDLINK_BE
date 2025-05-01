import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from '@/src/domain/performances/entities/performance.entity';
import { User } from '@/src/domain/users/entities/user.entity';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { PerformanceReservation } from '@/src/domain/performanceReservation/entities/performanceReservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Performance,
      User,
      Room,
      RoomReservation,
      PerformanceReservation,
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
