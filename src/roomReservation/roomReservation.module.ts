import { Module } from '@nestjs/common';
import { RoomReservationService } from './roomReservation.service';
import { RoomReservationController } from './roomReservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomReservation } from '@/src/roomReservation/entities/roomReservation.entity';
import { User } from '@/src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomReservation, User])],
  controllers: [RoomReservationController],
  providers: [RoomReservationService],
})
export class RoomReservationModule {}
