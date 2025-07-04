import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from '@/src/domain/performances/entities/performance.entity';
import { CreatePerformanceDto } from '@/src/domain/performances/dto/createPerformance.dto';
import { User } from '@/src/domain/users/entities/user.entity';
import { Room } from '@/src/domain/rooms/entities/room.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { PerformancesResponse } from '@/src/domain/performances/dto/performancesResponse.dto';
import { PerformanceReservation } from '@/src/domain/performanceReservation/entities/performanceReservation.entity';
import { PerformanceDetailResponseDto } from '@/src/domain/performances/dto/performanceDetail.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,

    @InjectRepository(RoomReservation)
    private readonly roomReservationRepository: Repository<RoomReservation>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(PerformanceReservation)
    private readonly performanceReservationRepository: Repository<PerformanceReservation>,
  ) {}

  async getPerformances(): Promise<PerformancesResponse[]> {
    const performances = await this.performanceRepository.find({
      relations: ['user'],
    });

    return performances.map((p) => ({
      id: p.id,
      posterUrl: p.posterUrl,
      title: p.title,
      bandname: p.user.bandname,
      price: p.price,
      startTime: p.start_time,
    }));
  }

  async getMyPerformances(googleUid: string): Promise<Performance[]> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException('등록되지 않은 사용자입니다.');
    return this.performanceRepository.find({
      where: { user: { googleUid: googleUid } },
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

  async getMyReservedRooms(googleUid: string) {
    const user = await this.userRepository.findOne({
      where: { googleUid },
    });

    if (!user) throw new UnauthorizedException();

    const reservations = await this.roomReservationRepository.find({
      where: { reservedBy: user },
      relations: ['room', 'room.place'],
    });

    return reservations.map((r) => ({
      reservationId: r.id,
      roomName: r.room.name,
      address: r.room.place.address,
      startTime: new Date(r.startDate),
      endTime: new Date(r.endDate),
    }));
  }

  async getPerformanceDetail(
    performanceId: number,
  ): Promise<PerformanceDetailResponseDto> {
    const performance = await this.performanceRepository.findOne({
      where: { id: performanceId },
      relations: ['user'],
    });
    if (!performance) throw new BadRequestException('공연을 찾을 수 없습니다.');

    return {
      id: performance.id,
      posterUrl: performance.posterUrl,
      title: performance.title,
      description: performance.description,
      address: performance.address,
      start_time: performance.start_time,
      end_time: performance.end_time,
      price: performance.price,
      createdAt: performance.createdAt,
      bandname: performance.user?.bandname ?? '',
    };
  }

  async reservePerformance(
    performanceId: number,
    googleUid: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const performance = await this.performanceRepository.findOne({
      where: { id: performanceId },
    });
    if (!performance) throw new NotFoundException('Performance not found');

    const reservation = this.performanceReservationRepository.create({
      user,
      performance,
    });

    await this.performanceReservationRepository.save(reservation);
  }
}
