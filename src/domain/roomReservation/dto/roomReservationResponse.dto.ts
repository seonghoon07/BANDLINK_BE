export class RoomReservationResponseDto {
  id: number;
  roomId: number;
  roomName: string;
  userName: string;
  startDate: Date;
  endDate: Date;
  price: number;
  placeName: string;
  address: string;
}
