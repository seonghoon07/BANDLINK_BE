import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID', ''),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET', ''),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:8080/auth/google/callback',
      ),
      scope: ['profile', 'email'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): {
    jwt: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
    };
  } {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName ?? 'Unknown';

    if (!email) {
      throw new UnauthorizedException('No email found in Google profile');
    }

    const payload = {
      sub: profile.id,
      email,
    };

    const jwtToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshJwt = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '14d',
    });

    return {
      jwt: jwtToken,
      refreshToken: refreshJwt,
      user: {
        id: profile.id,
        email,
        name,
      },
    };
  }
}
