import { Injectable } from '@nestjs/common';
import { redisClient } from '@/src/redis/redis.provider';

@Injectable()
export class UsersService {
  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const key = `refresh:${userId}`;
    await redisClient.set(key, token, 'EX', 60 * 60 * 24 * 14);
  }

  async verifyRefreshToken(userId: number, token: string): Promise<boolean> {
    const key = `refresh:${userId}`;
    const stored = await redisClient.get(key);
    return stored === token;
  }

  async removeRefreshToken(userId: number): Promise<void> {
    const key = `refresh:${userId}`;
    await redisClient.del(key);
  }
}
