import {
  Controller,
  Get,
  Post,
  Body,
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
    const googleUser = req.user as {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    const payload = {
      sub: googleUser.user.id,
      email: googleUser.user.email,
    };

    const accessToken = this.authService.generateAccessToken(payload);
    const refreshToken = this.authService.generateRefreshToken(payload);

    await this.usersService.saveRefreshToken(Number(payload.sub), refreshToken);

    const successRedirect = `${this.configService.get<string>(
      'FRONTEND_REDIRECT_SUCCESS',
    )}?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    return res.redirect(successRedirect);
  }

  @Post('refresh')
  async refreshAccessToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-0',
        message: 'Refresh token is required.',
      });
    }

    let payload: { sub: string; email: string };

    try {
      payload = this.jwtService.verify<{ sub: string; email: string }>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          statusCode: 401,
          errorCode: '401-1',
          message: 'Refresh token expired',
        });
      }

      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-0',
        message: 'Invalid refresh token',
      });
    }

    const isValid = await this.usersService.verifyRefreshToken(
      Number(payload.sub),
      refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-2',
        message: 'Refresh token does not match.',
      });
    }

    const newAccessToken = this.authService.generateAccessToken({
      sub: payload.sub,
      email: payload.email,
    });

    return { accessToken: newAccessToken };
  }
}
