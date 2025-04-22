import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from '@/src/performances/entities/performance.entity';
import { CreatePerformanceDto } from '@/src/performances/dto/createPerformance.dto';
import { User } from '@/src/users/entities/user.entity';
import { Room } from '@/src/rooms/entities/room.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async getMyPerformances(userId: number): Promise<Performance[]> {
    return this.performanceRepository.find({
      where: { user: { id: userId } },
    });
  }

  async createPerformance(dto: CreatePerformanceDto, googleUid: string) {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException('유저 정보를 찾을 수 없습니다.');

    const room = await this.roomRepository.findOne({
      where: { id: dto.roomId },
    });
    if (!room)
      throw new BadRequestException('해당 roomId의 장소를 찾을 수 없습니다');

    const performance = this.performanceRepository.create({
      ...dto,
      start_time: new Date(dto.start_time),
      end_time: new Date(dto.end_time),
      user,
      room,
    });

    return this.performanceRepository.save(performance);
  }
}
