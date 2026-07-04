import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Controller('operadores')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  @RequirePermissions('operadores.visualizar')
  findAll(@Query('search') search?: string) {
    return this.operatorsService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions('operadores.visualizar')
  findOne(@Param('id') id: string) {
    return this.operatorsService.findOne(id);
  }

  @Post()
  @RequirePermissions('operadores.criar')
  create(@Body() dto: CreateOperatorDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.operatorsService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('operadores.editar')
  update(@Param('id') id: string, @Body() dto: UpdateOperatorDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.operatorsService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('operadores.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.operatorsService.remove(id, user, ip);
  }
}
