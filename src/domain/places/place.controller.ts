import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreatePlaceDto } from '@/src/domain/places/dto/createPlaceRequest.dto';

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

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  async getMyPlace(@Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.placeService.getMyPlace(googleUid);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async createPlaceWithRooms(@Body() dto: CreatePlaceDto, @Req() req: Request) {
    const googleUid = (req.user as { userId: string }).userId;
    return this.placeService.createPlace(dto, googleUid);
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
