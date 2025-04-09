import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from '@/src/auth/dto/refresh-token.dto';
import { AuthService } from '@/src/auth/auth.service';
import { GoogleAuthService } from '@/src/auth/google-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = req.user as {
      jwt: string;
      refreshToken: string;
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    await this.usersService.saveRefreshToken(
      Number(user.user.id),
      user.refreshToken,
    );

    if (user?.jwt) {
      const redirectUrl = `${this.configService.get<string>('FRONTEND_REDIRECT_SUCCESS')}?accessToken=${user.jwt}&refreshToken=${user.refreshToken}`;
      res.redirect(redirectUrl);
    } else {
      const failureUrl =
        this.configService.get<string>('FRONTEND_REDIRECT_FAILURE') ??
        'http://localhost:5173/login/failure';
      res.redirect(failureUrl);
    }
  }

  @Post()
  async refreshAccessToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: { sub: string; email: string };

    try {
      payload = this.jwtService.verify<{ sub: string; email: string }>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const isValid = await this.usersService.verifyRefreshToken(
      Number(payload.sub),
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('Refresh token does not match.');
    }

    const newAccessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );

    return { accessToken: newAccessToken };
  }

  @Post()
  async login(@Body('code') code: string) {
    const user = await this.googleAuthService.getUserInfoFromCode(code);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }
}
