import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'bandlink',
  password: 'c5752512',
  database: 'bandlink_db',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
