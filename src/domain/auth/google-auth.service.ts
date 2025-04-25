import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserResponse {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  async getUserInfoFromCode(code: string): Promise<GoogleUserResponse> {
    try {
      const tokenRes: AxiosResponse<GoogleTokenResponse> = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
          client_secret: this.configService.getOrThrow<string>(
            'GOOGLE_CLIENT_SECRET',
          ),
          redirect_uri: this.configService.getOrThrow<string>(
            'GOOGLE_CALLBACK_URL',
          ),
          grant_type: 'authorization_code',
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      const accessToken = tokenRes.data.access_token;

      const userRes: AxiosResponse<GoogleUserResponse> = await axios.get(
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
    } catch {
      throw new UnauthorizedException('Google login failed');
    }
  }
}
