import Redis from 'ioredis';

export const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
});

export const RedisProvider = {
  provide: 'REDIS_CLIENT',
  useValue: redisClient,
};
