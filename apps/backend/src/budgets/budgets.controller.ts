import { Body, Controller, Get, Ip, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetStatusDto } from './dto/update-budget-status.dto';
import { BudgetStatus } from '@prisma/client';

@Controller('orcamentos')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @RequirePermissions('orcamentos.visualizar')
  findAll(@Query('status') status?: BudgetStatus, @Query('clientId') clientId?: string) {
    return this.budgetsService.findAll(status, clientId);
  }

  @Get(':id')
  @RequirePermissions('orcamentos.visualizar')
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Post()
  @RequirePermissions('orcamentos.criar')
  create(@Body() dto: CreateBudgetDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.budgetsService.create(dto, user, ip);
  }

  @Patch(':id/status')
  @RequirePermissions('orcamentos.editar')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBudgetStatusDto, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.budgetsService.updateStatus(id, dto, user, ip);
  }

  @Post(':id/converter')
  @RequirePermissions('orcamentos.editar', 'os.criar')
  convert(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.budgetsService.convertToOrder(id, user, ip);
  }
}
