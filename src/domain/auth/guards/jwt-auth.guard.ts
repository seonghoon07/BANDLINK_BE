import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-1',
        message: 'Access token expired',
      });
    }

    if (err || !user) {
      throw new UnauthorizedException({
        statusCode: 401,
        errorCode: '401-0',
        message: 'Invalid or missing access token',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
