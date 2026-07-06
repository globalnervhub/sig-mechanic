import { Body, Controller, Delete, Get, Ip, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { OilChangesService } from './oil-changes.service';
import { CreateOilChangeDto } from './dto/create-oil-change.dto';

@Controller('trocas-oleo')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OilChangesController {
  constructor(private readonly oilChangesService: OilChangesService) {}

  @Get()
  @RequirePermissions('trocas_oleo.visualizar')
  findAll(@Query('vehicleId') vehicleId?: string) {
    return this.oilChangesService.findAll(vehicleId);
  }

  @Get('veiculos')
  @RequirePermissions('trocas_oleo.visualizar')
  findVehiclesOverview(@Query('search') search?: string) {
    return this.oilChangesService.findVehiclesOverview(search);
  }

  @Post()
  @RequirePermissions('trocas_oleo.criar')
  create(@Body() dto: CreateOilChangeDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.oilChangesService.create(dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('trocas_oleo.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.oilChangesService.remove(id, user, ip);
  }
}
