import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ModelsService } from './models.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';

@Controller('modelos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  @RequirePermissions('veiculos.visualizar')
  findAll(@Query('brandId') brandId?: string, @Query('search') search?: string) {
    return this.modelsService.findAll(brandId, search);
  }

  @Get(':id')
  @RequirePermissions('veiculos.visualizar')
  findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id);
  }

  @Post()
  @RequirePermissions('veiculos.criar')
  create(@Body() dto: CreateModelDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.modelsService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('veiculos.editar')
  update(@Param('id') id: string, @Body() dto: UpdateModelDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.modelsService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('veiculos.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.modelsService.remove(id, user, ip);
  }
}
