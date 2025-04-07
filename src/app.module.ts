import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmModuleOptions } from './configs/typeorm.config';
import { UsersModule } from './users/users.module';
import { PlaceModule } from './places/place.module';
import { PerformanceModule } from '@/src/performances/performance.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmModuleOptions), UsersModule, PlaceModule, PerformanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
