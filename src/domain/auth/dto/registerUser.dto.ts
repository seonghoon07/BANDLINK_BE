import { IsString, IsIn, ValidateIf } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  nickname: string;

  @IsIn(['FAN', 'BAND', 'PLACE_OWNER'])
  role: 'FAN' | 'BAND' | 'PLACE_OWNER';

  @ValidateIf((o: RegisterUserDto) => o.role === 'BAND')
  @IsString({ message: '밴드 유저는 bandname이 필요합니다.' })
  bandname?: string;
}
