import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { MechanicsService } from './mechanics.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';

@Controller('mecanicos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @RequirePermissions('mecanicos.visualizar')
  findAll(@Query('search') search?: string) {
    return this.mechanicsService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions('mecanicos.visualizar')
  findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Post()
  @RequirePermissions('mecanicos.criar')
  create(@Body() dto: CreateMechanicDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.mechanicsService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('mecanicos.editar')
  update(@Param('id') id: string, @Body() dto: UpdateMechanicDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.mechanicsService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('mecanicos.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.mechanicsService.remove(id, user, ip);
  }
}
