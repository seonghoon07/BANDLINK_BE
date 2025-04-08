import { Module } from '@nestjs/common';
import { RoomReservationService } from './roomReservation.service';
import { RoomReservationController } from './roomReservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomReservation])],
  controllers: [RoomReservationController],
  providers: [RoomReservationService],
})
export class RoomReservationModule {}
