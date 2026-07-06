import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('marcas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @RequirePermissions('veiculos.visualizar')
  findAll(@Query('search') search?: string) {
    return this.brandsService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions('veiculos.visualizar')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post()
  @RequirePermissions('veiculos.criar')
  create(@Body() dto: CreateBrandDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.brandsService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('veiculos.editar')
  update(@Param('id') id: string, @Body() dto: UpdateBrandDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.brandsService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('veiculos.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.brandsService.remove(id, user, ip);
  }
}
