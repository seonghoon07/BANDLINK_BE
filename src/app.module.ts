import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { PlaceModule } from './places/place.module';
import { PerformanceModule } from '@/src/performances/performance.module';
import { RoomModule } from './room/room.module';
import { PerformanceReservationModule } from '@/src/performanceReservation/performanceReservation.module';
import { RoomReservationModule } from '@/src/roomReservation/roomReservation.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), UsersModule, PlaceModule, PerformanceModule, RoomModule, PerformanceReservationModule, RoomReservationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
