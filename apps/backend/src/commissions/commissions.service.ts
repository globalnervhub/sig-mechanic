import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { CommissionStatus } from '@prisma/client';

@Injectable()
export class CommissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(status?: CommissionStatus, mechanicId?: string) {
    return this.prisma.commission.findMany({
      where: { status: status ?? undefined, mechanicId: mechanicId ?? undefined },
      include: {
        mechanic: true,
        order: { include: { client: true, vehicle: { include: { brand: true, model: true } } } },
        orderService: { include: { service: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markPaid(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.prisma.commission.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Comissao nao encontrada');

    const commission = await this.prisma.commission.update({
      where: { id },
      data: { status: CommissionStatus.PAID, paidAt: new Date() },
    });

    await this.audit.log({ user, action: 'UPDATE', entity: 'Commission', entityId: id, before, after: commission, ip });
    return commission;
  }
}
