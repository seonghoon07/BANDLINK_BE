import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmModuleOptions } from '@/src/global/configs/typeorm.config';
import { UsersModule } from '@/src/domain/users/users.module';
import { PlaceModule } from '@/src/domain/places/place.module';
import { PerformanceModule } from '@/src/domain/performances/performance.module';
import { RoomModule } from '@/src/domain/rooms/room.module';
import { PerformanceReservationModule } from '@/src/domain/performanceReservation/performanceReservation.module';
import { RoomReservationModule } from '@/src/domain/roomReservation/roomReservation.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/src/domain/auth/auth.module';
import { AwsModule } from '@/src/global/aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    PlaceModule,
    PerformanceModule,
    RoomModule,
    PerformanceReservationModule,
    RoomReservationModule,
    AuthModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
