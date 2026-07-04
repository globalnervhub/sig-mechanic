import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { SettlePaymentDto } from './dto/settle-payment.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { PayableStatus, ReceivableStatus } from '@prisma/client';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---------- Contas a Pagar ----------

  findAllPayables(status?: PayableStatus) {
    return this.prisma.payable.findMany({
      where: { status: status ?? undefined },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createPayable(dto: CreatePayableDto, user: AuthenticatedUser, ip?: string) {
    const payable = await this.prisma.payable.create({
      data: { ...dto, dueDate: new Date(dto.dueDate) },
    });
    await this.audit.log({ user, action: 'CREATE', entity: 'Payable', entityId: payable.id, after: payable, ip });
    return payable;
  }

  async payPayable(id: string, dto: SettlePaymentDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.prisma.payable.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Conta a pagar nao encontrada');

    const payable = await this.prisma.payable.update({
      where: { id },
      data: {
        status: PayableStatus.PAID,
        paidAt: new Date(),
        paidAmount: dto.amount ?? before.amount,
      },
    });

    await this.audit.log({ user, action: 'UPDATE', entity: 'Payable', entityId: id, before, after: payable, ip });
    return payable;
  }

  // ---------- Contas a Receber ----------

  findAllReceivables(status?: ReceivableStatus) {
    return this.prisma.receivable.findMany({
      where: { status: status ?? undefined },
      include: { client: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async createReceivable(dto: CreateReceivableDto, user: AuthenticatedUser, ip?: string) {
    const receivable = await this.prisma.receivable.create({
      data: { ...dto, dueDate: new Date(dto.dueDate) },
    });
    await this.audit.log({ user, action: 'CREATE', entity: 'Receivable', entityId: receivable.id, after: receivable, ip });
    return receivable;
  }

  async receiveReceivable(id: string, dto: SettlePaymentDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.prisma.receivable.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Conta a receber nao encontrada');

    const receivable = await this.prisma.receivable.update({
      where: { id },
      data: {
        status: ReceivableStatus.RECEIVED,
        receivedAt: new Date(),
        receivedAmount: dto.amount ?? before.amount,
      },
    });

    await this.audit.log({ user, action: 'UPDATE', entity: 'Receivable', entityId: id, before, after: receivable, ip });
    return receivable;
  }

  // ---------- Fluxo de Caixa (visao consolidada) ----------

  async getCashFlow() {
    const [payables, receivables] = await Promise.all([
      this.prisma.payable.findMany({ orderBy: { dueDate: 'asc' } }),
      this.prisma.receivable.findMany({ include: { client: true }, orderBy: { dueDate: 'asc' } }),
    ]);

    const entries = [
      ...receivables.map((r) => ({
        id: r.id,
        date: r.receivedAt ?? r.dueDate,
        description: r.description,
        type: 'IN' as const,
        amount: Number(r.receivedAmount ?? r.amount),
        settled: r.status === ReceivableStatus.RECEIVED,
      })),
      ...payables.map((p) => ({
        id: p.id,
        date: p.paidAt ?? p.dueDate,
        description: p.description,
        type: 'OUT' as const,
        amount: Number(p.paidAmount ?? p.amount),
        settled: p.status === PayableStatus.PAID,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    let balance = 0;
    const withBalance = entries.map((e) => {
      if (e.settled) {
        balance += e.type === 'IN' ? e.amount : -e.amount;
      }
      return { ...e, runningBalance: balance };
    });

    return { entries: withBalance, currentBalance: balance };
  }
}
