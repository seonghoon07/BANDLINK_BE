import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RefreshTokenDto } from '@/src/auth/dto/refresh-token.dto';
import { AuthService } from '@/src/auth/auth.service';

interface RegisterUserDto {
  nickname: string;
  roles: ('FAN' | 'BAND' | 'PLACE_OWNER')[];
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.handleGoogleCallback(req, res);
  }

  @Post('refresh')
  async refreshAccessToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.handleRefresh(refreshTokenDto);
  }

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async registerUser(
    @Body() body: RegisterUserDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    return this.authService.registerUser(body, req);
  }
}
