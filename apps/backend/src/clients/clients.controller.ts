import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions('clientes.visualizar')
  findAll(@Query('search') search?: string) {
    return this.clientsService.findAll(search);
  }

  @Get(':id')
  @RequirePermissions('clientes.visualizar')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @RequirePermissions('clientes.criar')
  create(@Body() dto: CreateClientDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.clientsService.create(dto, user, ip);
  }

  @Patch(':id')
  @RequirePermissions('clientes.editar')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.clientsService.update(id, dto, user, ip);
  }

  @Delete(':id')
  @RequirePermissions('clientes.excluir')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.clientsService.remove(id, user, ip);
  }
}
