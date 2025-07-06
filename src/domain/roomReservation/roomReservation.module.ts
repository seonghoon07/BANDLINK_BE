import { Module } from '@nestjs/common';
import { RoomReservationService } from './roomReservation.service';
import { RoomReservationController } from './roomReservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { User } from '@/src/domain/users/entities/user.entity';
import { Place } from '@/src/domain/places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomReservation, User, Place])],
  controllers: [RoomReservationController],
  providers: [RoomReservationService],
})
export class RoomReservationModule {}
