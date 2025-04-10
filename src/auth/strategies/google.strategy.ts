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

  validate(accessToken: string, refreshToken: string, profile: Profile): any {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;

    if (!email) throw new UnauthorizedException('No email in profile');

    return {
      user: {
        id: profile.id,
        email,
        name,
      },
    };
  }
}
