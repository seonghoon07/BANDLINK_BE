export class CreatePlaceDto {
  place: {
    imageUrl: string;
    name: string;
    type: string;
    address: string;
    businessDays: string[];
    businessRegistrationNumber: string;
    openTime: string;
    closeTime: string;
  };
  rooms: {
    name: string;
    description: string;
    additionalDescription: string;
    price: number;
    imageUrl: string;
  }[];
}
