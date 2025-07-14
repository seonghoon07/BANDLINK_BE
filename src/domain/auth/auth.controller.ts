import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registerUser.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
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

  @Delete('/')
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    const user = req.user;
    await this.authService.logout(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    res.status(200).json({ message: 'Logout successful' });
  }
}
