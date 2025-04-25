import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '@/src/domain/places/entities/place.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { User } from '@/src/domain/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Place, RoomReservation, User])],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
