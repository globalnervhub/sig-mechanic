import { Body, Controller, Get, Ip, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('usuarios.visualizar')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('roles')
  @RequirePermissions('usuarios.visualizar')
  findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Post()
  @RequirePermissions('usuarios.criar')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.usersService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('usuarios.editar')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.usersService.update(id, dto, user, ip);
  }
}
