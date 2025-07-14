import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { RoomReservationResponseDto } from '@/src/domain/roomReservation/dto/roomReservationResponse.dto';
import { toZonedTime, format } from 'date-fns-tz';
import { ko } from 'date-fns/locale';

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

  async getRoomReservations(
    googleUid: string,
  ): Promise<RoomReservationResponseDto[]> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const reservations = await this.roomReservationRepository.find({
      where: { reservedBy: { id: user.id } },
      relations: ['room', 'reservedBy', 'room.place'],
    });

    const convertToKST = (date: Date): string => {
      const kstDate = toZonedTime(date, 'Asia/Seoul');
      return format(kstDate, "yyyy-MM-dd'T'HH:mm:ssXXX");
    };

    return reservations.map((r) => ({
      id: r.id,
      roomId: r.room.id,
      roomName: r.room.name,
      userName: r.reservedBy.nickname,
      startDate: convertToKST(r.startDate),
      endDate: convertToKST(r.endDate),
      price: r.price,
      placeName: r.room.place.name,
      address: r.room.place.address,
    }));
  }
  async getGroupedReservationsByMyPlace(googleUid: string) {
    const user = await this.userRepository.findOne({
      where: { googleUid },
      relations: ['place'],
    });

    if (!user || !user.place) {
      throw new NotFoundException('유저 또는 장소를 찾을 수 없습니다.');
    }

    const reservations = await this.roomReservationRepository.find({
      where: {
        room: { place: { id: user.place.id } },
      },
      relations: ['room', 'reservedBy', 'room.place'],
      order: { startDate: 'ASC' },
    });

    const grouped = reservations.reduce(
      (acc, curr) => {
        const kstStart = toZonedTime(curr.startDate, 'Asia/Seoul');
        const kstEnd = toZonedTime(curr.endDate, 'Asia/Seoul');

        const dateKey = format(kstStart, 'yyyy-MM-dd');

        const formattedReservation = {
          roomName: curr.room.name,
          startTime: format(kstStart, 'a h:mm', { locale: ko }),
          endTime: format(kstEnd, 'a h:mm', { locale: ko }),
          userName: curr.reservedBy.nickname,
          price: curr.price,
        };

        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(formattedReservation);

        return acc;
      },
      {} as Record<string, any[]>,
    );

    return Object.entries(grouped).map(([date, reservations]) => ({
      date,
      reservations,
    }));
  }
}
