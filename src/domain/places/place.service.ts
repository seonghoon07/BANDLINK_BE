import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from '@/src/domain/places/entities/place.entity';
import { Repository } from 'typeorm';
import { User } from '@/src/domain/users/entities/user.entity';
import { RoomReservation } from '@/src/domain/roomReservation/entities/roomReservation.entity';
import { CreatePlaceDto } from '@/src/domain/places/dto/createPlaceRequest.dto';
import { Room } from '@/src/domain/rooms/entities/room.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,

    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RoomReservation)
    private readonly roomReservationRepository: Repository<RoomReservation>,
  ) {}

  async getRecommendedPlaces(): Promise<Place[]> {
    return await this.placesRepository
      .createQueryBuilder('place')
      .where('place.isRecommended = :isRecommended', { isRecommended: true })
      .limit(5)
      .getMany();
  }

  async getPlaces(): Promise<any[]> {
    return await this.placesRepository.find({
      relations: ['rooms'],
    });
  }

  async getPlaceById(id: number): Promise<Place | null> {
    return await this.placesRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.rooms', 'room')
      .where('place.id = :id', { id })
      .getOne();
  }

  async getDashboard(googleUid: string): Promise<{
    count: number;
    firstEnterTime: string | null;
    lastLeaveTime: string | null;
  }> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const nowKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
    const year = nowKST.getUTCFullYear();
    const month = nowKST.getUTCMonth();
    const date = nowKST.getUTCDate();

    const kstMidnight = new Date(Date.UTC(year, month, date, 0, 0, 0));
    const start = new Date(kstMidnight.getTime() - 9 * 60 * 60 * 1000);

    const kstEnd = new Date(Date.UTC(year, month, date, 23, 59, 59));
    const end = new Date(kstEnd.getTime() - 9 * 60 * 60 * 1000);

    const reservations = await this.roomReservationRepository
      .createQueryBuilder('reservation')
      .innerJoin('reservation.room', 'room')
      .innerJoin('room.place', 'place')
      .where('place.userId = :userId', { userId: user.id })
      .andWhere('reservation.startDate BETWEEN :start AND :end', { start, end })
      .orderBy('reservation.startDate', 'ASC')
      .addOrderBy('reservation.endDate', 'DESC')
      .getMany();

    const firstEnterTime =
      reservations.reduce(
        (earliest, r) =>
          !earliest || r.startDate < earliest.startDate ? r : earliest,
        null as (typeof reservations)[number] | null,
      )?.startDate || null;

    const lastLeaveTime =
      reservations.reduce(
        (latest, r) => (!latest || r.endDate > latest.endDate ? r : latest),
        null as (typeof reservations)[number] | null,
      )?.endDate || null;

    const toISOStringKST = (date: Date): string =>
      new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString();

    return {
      count: reservations.length,
      firstEnterTime: firstEnterTime ? toISOStringKST(firstEnterTime) : null,
      lastLeaveTime: lastLeaveTime ? toISOStringKST(lastLeaveTime) : null,
    };
  }

  async getMyPlace(googleUid: string): Promise<Place | null> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const myPlace = await this.placesRepository.findOne({
      where: {
        user: { id: user.id },
      },
      relations: ['rooms'],
    });

    return myPlace ?? null;
  }

  async createPlace(dto: CreatePlaceDto, googleUid: string) {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const place = this.placesRepository.create({
      ...dto.place,
      user,
    });
    await this.placesRepository.save(place);

    const rooms = dto.rooms.map((room) =>
      this.roomRepository.create({
        ...room,
        place,
      }),
    );
    await this.roomRepository.save(rooms);

    return { message: '장소 및 방 등록 완료', placeId: place.id };
  }
}
