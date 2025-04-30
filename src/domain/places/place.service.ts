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

  async getPlaces(): Promise<Place[]> {
    return await this.placesRepository.find();
  }

  async getPlaceById(id: number): Promise<Place | null> {
    return await this.placesRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.rooms', 'room')
      .where('place.id = :id', { id })
      .getOne();
  }

  async getDashboard(googleUid: string): Promise<{
    todayReservationCount: number;
    firstEnterTime: string | null;
    lastLeaveTime: string | null;
  }> {
    const user = await this.userRepository.findOne({ where: { googleUid } });
    if (!user) throw new UnauthorizedException();

    const now = new Date();
    const offset = 9 * 60 * 60 * 1000;
    const nowKST = new Date(now.getTime() + offset);

    const start = new Date(
      nowKST.getFullYear(),
      nowKST.getMonth(),
      nowKST.getDate(),
      0,
      0,
      0,
    );
    const end = new Date(
      nowKST.getFullYear(),
      nowKST.getMonth(),
      nowKST.getDate(),
      23,
      59,
      59,
    );

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
      reservations.length > 0 ? reservations[0].startDate : null;
    const lastLeaveTime =
      reservations.length > 0
        ? reservations.reduce((latest, r) =>
            new Date(r.endDate) > new Date(latest.endDate) ? r : latest,
          ).endDate
        : null;

    const toKSTISOString = (date: Date): string =>
      new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString();

    return {
      todayReservationCount: reservations.length,
      firstEnterTime: firstEnterTime ? toKSTISOString(firstEnterTime) : null,
      lastLeaveTime: lastLeaveTime ? toKSTISOString(lastLeaveTime) : null,
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
