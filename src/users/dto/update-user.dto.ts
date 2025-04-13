import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  roles?: ('FAN' | 'BAND' | 'PLACE_OWNER')[];

  @ValidateIf((object: UpdateUserDto) => !!object.roles?.includes('BAND'))
  @IsString({ message: '밴드 역할에는 bandname이 필수입니다.' })
  bandname?: string;
}
