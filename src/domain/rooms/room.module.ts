import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { Place } from '@/src/domain/places/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomReservation, Place])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
