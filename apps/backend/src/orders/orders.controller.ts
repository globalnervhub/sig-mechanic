import { Body, Controller, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Controller('os')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @RequirePermissions('os.visualizar')
  findAll(@Query('status') status?: OrderStatus, @Query('clientId') clientId?: string) {
    return this.ordersService.findAll(status, clientId);
  }

  @Get(':id')
  @RequirePermissions('os.visualizar')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @RequirePermissions('os.criar')
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.ordersService.create(dto, user, ip);
  }

  @Patch(':id/status')
  @RequirePermissions('os.editar')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.ordersService.updateStatus(id, dto, user, ip);
  }
}
