import { Controller, Get, Ip, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CommissionsService } from './commissions.service';
import { CommissionStatus } from '@prisma/client';

@Controller('comissoes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @RequirePermissions('financeiro.visualizar')
  findAll(@Query('status') status?: CommissionStatus, @Query('mechanicId') mechanicId?: string) {
    return this.commissionsService.findAll(status, mechanicId);
  }

  @Patch(':id/pagar')
  @RequirePermissions('financeiro.editar')
  markPaid(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Ip() ip: string) {
    return this.commissionsService.markPaid(id, user, ip);
  }
}
