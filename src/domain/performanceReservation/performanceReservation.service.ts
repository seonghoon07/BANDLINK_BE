import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { PerformanceReservation } from '@/src/domain/performanceReservation/entities/performanceReservation.entity';
import { MyReservationResponseDto } from '@/src/domain/performanceReservation/dto/myReservationResponse.dto';

@Injectable()
export class PerformanceReservationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PerformanceReservation)
    private readonly performanceReservationRepository: Repository<PerformanceReservation>,
  ) {}
  async getMyPerformanceReservation(
    googleUid: string,
  ): Promise<MyReservationResponseDto[]> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const reservations = await this.performanceReservationRepository.find({
      where: { user: { id: user.id } },
      relations: ['performance', 'performance.room', 'performance.room.place'],
      order: { reservedAt: 'DESC' },
    });

    return reservations.map((res) => {
      const performance = res.performance;
      const place = performance.room.place;

      return {
        posterUrl: performance.posterUrl,
        title: performance.title,
        reservedAt: res.reservedAt.toISOString().split('T')[0],
        place: place.address,
        price: performance.price,
      };
    });
  }
}
