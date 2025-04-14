import { Injectable, NotFoundException } from '@nestjs/common';
import { redisClient } from '@/src/redis/redis.provider';
import { User } from '@/src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserRoleDto } from '@/src/users/dto/updateUserRole.dto';

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

  async addRoleAndBandname(
    userId: number,
    dto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const alreadyHasRole = user.roles.includes(dto.role);
    if (alreadyHasRole) return user;

    if (!user.roles.includes(dto.role)) {
      user.roles.push(dto.role);
    }

    if (dto.role === 'BAND' && dto.bandname) {
      user.bandname = dto.bandname;
    }

    return this.userRepository.save(user);
  }
}
