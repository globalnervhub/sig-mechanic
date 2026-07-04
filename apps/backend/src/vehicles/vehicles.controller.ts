import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('veiculos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @RequirePermissions('veiculos.visualizar')
  findAll(@Query('search') search?: string, @Query('clientId') clientId?: string) {
    return this.vehiclesService.findAll(search, clientId);
  }

  @Get(':id')
  @RequirePermissions('veiculos.visualizar')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @RequirePermissions('veiculos.criar')
  create(@Body() dto: CreateVehicleDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.vehiclesService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('veiculos.editar')
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.vehiclesService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('veiculos.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.vehiclesService.remove(id, user, ip);
  }
}
