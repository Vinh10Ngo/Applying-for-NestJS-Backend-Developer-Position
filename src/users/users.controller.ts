import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: CurrentUserPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    const list = await this.usersService.findAll();
    return list.map((u) => ({
      id: u._id?.toString(),
      _id: u._id,
      email: u.email,
      fullName: u.fullName,
      name: u.fullName ?? '',
      role: u.role ?? 'user',
    }));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }
}