import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from '@/src/domain/places/entities/place.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { User } from '@/src/domain/users/entities/user.entity';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { S3Module } from '@/src/global/aws/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, Room, RoomReservation, User]),
    S3Module,
  ],
  controllers: [PlaceController],
  providers: [PlaceService],
})
export class PlaceModule {}
