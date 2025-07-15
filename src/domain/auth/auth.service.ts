import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  NotFoundException, BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsersService } from '@/src/domain/users/users.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import Redis from 'ioredis';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '2h',
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

    // Redis에 저장
    await this.redis.set(
      `refreshToken:user:${payload.sub}`,
      refreshToken,
      'EX',
      14 * 24 * 60 * 60,
    );

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
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.redis.get(`refreshToken:user:${payload.sub}`);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedException('Refresh token does not match.');
    }

    const newAccessToken = this.generateAccessToken(payload);
    return { accessToken: newAccessToken };
  }

  async registerUser(
    dto: RegisterUserDto,
    req: Request,
  ): Promise<{ message: string }> {
    const user = req.user as { email: string; userId: string };

    const exists = await this.usersService.findByEmail(user.email);
    if (exists) {
      throw new ConflictException('이미 가입된 사용자입니다');
    }

    const userData = {
      email: user.email,
      googleUid: user.userId,
      nickname: dto.nickname,
      roles: [dto.role],
      ...(dto.role === 'BAND' && { bandname: dto.bandname }),
    };

    await this.usersService.createUser(userData);

    return { message: '회원가입 완료' };
  }

  async logout(userId: number): Promise<void> {
    const key = `refreshToken:user:${userId}`;
    await this.redis.del(key);
  }

  async delete(userId: string): Promise<void> {
    if (!userId) throw new BadRequestException('유효하지 않은 유저 ID입니다');

    await this.redis.del(`refreshToken:user:${userId}`);
    await this.usersService.deleteUser(userId);
  }
}
