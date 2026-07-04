import { Body, Controller, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { FinanceiroService } from './financeiro.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { SettlePaymentDto } from './dto/settle-payment.dto';
import { PayableStatus, ReceivableStatus } from '@prisma/client';

@Controller('financeiro')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('pagar')
  @RequirePermissions('financeiro.visualizar')
  findAllPayables(@Query('status') status?: PayableStatus) {
    return this.financeiroService.findAllPayables(status);
  }

  @Post('pagar')
  @RequirePermissions('financeiro.criar')
  createPayable(@Body() dto: CreatePayableDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.financeiroService.createPayable(dto, user, ip);
  }

  @Patch('pagar/:id/pagar')
  @RequirePermissions('financeiro.editar')
  payPayable(
    @Param('id') id: string,
    @Body() dto: SettlePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.financeiroService.payPayable(id, dto, user, ip);
  }

  @Get('receber')
  @RequirePermissions('financeiro.visualizar')
  findAllReceivables(@Query('status') status?: ReceivableStatus) {
    return this.financeiroService.findAllReceivables(status);
  }

  @Post('receber')
  @RequirePermissions('financeiro.criar')
  createReceivable(@Body() dto: CreateReceivableDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.financeiroService.createReceivable(dto, user, ip);
  }

  @Patch('receber/:id/receber')
  @RequirePermissions('financeiro.editar')
  receiveReceivable(
    @Param('id') id: string,
    @Body() dto: SettlePaymentDto,
    @CurrentUser() user: AuthenticatedUser,
    @Ip() ip: string,
  ) {
    return this.financeiroService.receiveReceivable(id, dto, user, ip);
  }

  @Get('fluxo-caixa')
  @RequirePermissions('financeiro.visualizar')
  getCashFlow() {
    return this.financeiroService.getCashFlow();
  }
}
