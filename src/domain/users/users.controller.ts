import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/src/domain/auth/guards/jwt-auth.guard';
import { UpdateUserRoleDto } from '@/src/domain/users/dto/updateUserRole.dto';
import { UsersService } from '@/src/domain/users/users.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Patch('role')
  updateRole(@Req() req: AuthenticatedRequest, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.addRoleAndBandname(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUser(@Req() req: AuthenticatedRequest) {
    console.log('req.user:', req.user);
    return this.usersService.findById(req.user.userId);
  }
}
