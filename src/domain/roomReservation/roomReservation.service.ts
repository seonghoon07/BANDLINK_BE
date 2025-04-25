import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';

@Injectable()
export class RoomReservationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RoomReservation)
    private readonly roomReservationRepository: Repository<RoomReservation>,
  ) {}
  async getRevenue(googleUid: string): Promise<{
    currentRevenue: number;
    lastMonthRevenue: number;
  }> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const getRevenueBetween = async (
      start: Date,
      end: Date,
    ): Promise<number> => {
      const result = await this.roomReservationRepository
        .createQueryBuilder('reservation')
        .select('SUM(reservation.price)', 'total')
        .innerJoin('reservation.room', 'room')
        .innerJoin('room.place', 'place')
        .where('place.userId = :userId', { userId: user.id })
        .andWhere('reservation.startDate BETWEEN :start AND :end', {
          start,
          end,
        })
        .getRawOne<{ total: string | null }>();

      return Number(result?.total) || 0;
    };

    const currentRevenue = await getRevenueBetween(startOfMonth, endOfMonth);
    const lastMonthRevenue = await getRevenueBetween(
      startOfLastMonth,
      endOfLastMonth,
    );

    return { currentRevenue, lastMonthRevenue };
  }
}
