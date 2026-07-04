import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ServiceCatalogService } from './service-catalog.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('servicos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiceCatalogController {
  constructor(private readonly serviceCatalogService: ServiceCatalogService) {}

  @Get()
  @RequirePermissions('servicos.visualizar')
  findAll(@Query('search') search?: string) {
    return this.serviceCatalogService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions('servicos.visualizar')
  findOne(@Param('id') id: string) {
    return this.serviceCatalogService.findOne(id);
  }

  @Post()
  @RequirePermissions('servicos.criar')
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.serviceCatalogService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('servicos.editar')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.serviceCatalogService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('servicos.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.serviceCatalogService.remove(id, user, ip);
  }
}
