import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get('/recommend')
  @UseGuards(JwtAuthGuard)
  getRecommendedPlaces() {
    return this.placeService.getRecommendedPlaces();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getPlaces() {
    return this.placeService.getPlaces();
  }

  @Get('/dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.placeService.getDashboard(googleUid);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPlaceDetails(@Param('id') id: string) {
    const place = await this.placeService.getPlaceById(Number(id));

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return {
      ...place,
      businessDays: place.businessDays ?? [],
    };
  }
}
