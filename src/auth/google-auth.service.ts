import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  async getUserInfoFromCode(code: string): Promise<{
    id: string;
    email: string;
    name: string;
  }> {
    try {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.getOrThrow<string>(
          'GOOGLE_CLIENT_SECRET',
        ),
        redirect_uri: this.configService.getOrThrow<string>(
          'GOOGLE_CALLBACK_URL',
        ),
        grant_type: 'authorization_code',
      });

      const accessToken = tokenRes.data.access_token;

      const userRes = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const { id, email, name } = userRes.data;

      if (!email || !id) {
        throw new UnauthorizedException('Incomplete user info from Google');
      }

      return { id, email, name };
    } catch (err) {
      throw new UnauthorizedException('Google login failed');
    }
  }
}
