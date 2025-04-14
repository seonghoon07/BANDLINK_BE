import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from '@/src/users/dto/update-user.dto';
import { UsersService } from '@/src/users/users.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserDto) {
    const userId = req.user.id;
    return this.userService.updateUser(userId, dto);
  }
}
