import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '@/src/users/users.service';

interface JwtPayload {
  sub: string;
  email: string;
}

interface RegisterUserDto {
  nickname: string;
  roles: ('FAN' | 'BAND' | 'PLACE_OWNER')[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '14d',
    });
  }

  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const googleUser = req.user as {
      user: {
        id: string;
        email: string;
        name: string;
      };
    };

    const payload: JwtPayload = {
      sub: googleUser.user.id,
      email: googleUser.user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    await this.usersService.saveRefreshToken(Number(payload.sub), refreshToken);

    const successRedirect = `${this.configService.get<string>(
      'FRONTEND_REDIRECT_SUCCESS',
    )}?accessToken=${accessToken}&refreshToken=${refreshToken}`;

    res.redirect(successRedirect);
  }

  async handleRefresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-0',
        message: 'Refresh token is required.',
      });
    }

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
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

    const newAccessToken = this.generateAccessToken(payload);
    return { accessToken: newAccessToken };
  }

  async registerUser(
    body: RegisterUserDto,
    req: Request,
  ): Promise<{ message: string }> {
    const user = req.user as { email: string; sub: string };

    const exists = await this.usersService.findByEmail(user.email);
    if (exists) {
      throw new ConflictException('이미 가입된 사용자입니다');
    }

    await this.usersService.createUser({
      email: user.email,
      nickname: body.nickname,
      roles: body.roles,
    });

    return { message: '회원가입 완료' };
  }
}
