import { IsIn, IsString, ValidateIf } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['FAN', 'BAND', 'PLACE_OWNER'])
  role: 'FAN' | 'BAND' | 'PLACE_OWNER';

  @ValidateIf((o: UpdateUserRoleDto) => o.role === 'BAND')
  @IsString({ message: '밴드 전환 시 bandname은 필수입니다.' })
  bandname?: string;
}
