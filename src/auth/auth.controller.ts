import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface GoogleJwtUser {
  jwt: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: Request, @Res() res: Response): void {
    const user = req.user as GoogleJwtUser;
    const jwt = user.jwt;

    const successRedirect = `${this.configService.get<string>('FRONTEND_REDIRECT_SUCCESS')}?token=${jwt}`;
    const failureRedirect =
      this.configService.get<string>('FRONTEND_REDIRECT_FAILURE') ??
      'http://localhost:5173/login/failure';

    if (jwt) res.redirect(successRedirect);
    else res.redirect(failureRedirect);
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  getProtected(@Req() req: Request) {
    return {
      message: '✅ 이건 로그인한 사람만 볼 수 있어요',
      user: req.user,
    };
  }
}
