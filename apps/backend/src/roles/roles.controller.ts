import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Controller('papeis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('papeis.visualizar')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissoes-disponiveis')
  @RequirePermissions('papeis.visualizar')
  findAvailablePermissions() {
    return this.rolesService.findAvailablePermissions();
  }

  @Get(':id')
  @RequirePermissions('papeis.visualizar')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('papeis.criar')
  create(@Body() dto: CreateRoleDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.rolesService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('papeis.editar')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.rolesService.update(id, dto, user, ip);
  }

  @Patch(':id/permissoes')
  @RequirePermissions('papeis.editar')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.rolesService.updatePermissions(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('papeis.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.rolesService.remove(id, user, ip);
  }
}
