import { Injectable, NotFoundException } from '@nestjs/common';
import { redisClient } from '@/src/redis/redis.provider';
import { User } from '@/src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '@/src/users/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const key = `refresh:${userId}`;
    await redisClient.set(key, token, 'EX', 60 * 60 * 24 * 14);
  }

  async verifyRefreshToken(userId: number, token: string): Promise<boolean> {
    const key = `refresh:${userId}`;
    const stored = await redisClient.get(key);
    return stored === token;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(userData: {
    email: string;
    nickname: string;
    roles: ('FAN' | 'BAND' | 'PLACE_OWNER')[];
    bandname?: string;
  }): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    if (dto.bandname && !dto.roles?.includes('BAND')) {
      dto.roles = [...(dto.roles ?? []), 'BAND'];
    }

    await this.userRepository.update(id, dto);

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
