import { IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../entities/user-role.enum'; // enum 따로 만들었다면

export class CreateUserDto {
  @IsString()
  nickname: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
