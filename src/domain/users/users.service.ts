import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { redisClient } from '@/src/global/redis/redis.provider';
import { User } from '@/src/domain/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserRoleDto } from '@/src/domain/users/dto/updateUserRole.dto';

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

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(userData: {
    email: string;
    nickname: string;
    roles: ('FAN' | 'BAND' | 'PLACE_OWNER')[];
    bandname?: string;
    googleUid: string;
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

    if (dto.role === 'BAND' && !dto.bandname) {
      throw new BadRequestException(
        'BAND 역할을 추가하려면 bandname이 필요합니다.',
      );
    }

    user.roles.push(dto.role);

    if (dto.role === 'BAND') {
      user.bandname = dto.bandname!;
    }

    return this.userRepository.save(user);
  }
}
