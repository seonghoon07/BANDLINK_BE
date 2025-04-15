import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '@/src/rooms/entities/rooms.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  controllers: [RoomController],
  providers: [RoomsService],
})
export class RoomsModule {}
