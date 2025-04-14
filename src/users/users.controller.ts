import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/auth/guards/jwt-auth.guard';
import { UpdateUserRoleDto } from '@/src/users/dto/updateUserRole.dto';
import { UsersService } from '@/src/users/users.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('me/role')
  updateRole(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.addRoleAndBandname(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.findById(req.user.id);
  }
}
