import { Module } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Performance } from '@/src/performances/entities/performance.entity';
import { User } from '@/src/users/entities/user.entity';
import { Room } from '@/src/rooms/entities/room.entity';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Performance, User, Room, RoomReservation]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
