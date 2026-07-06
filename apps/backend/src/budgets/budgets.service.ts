import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetStatusDto } from './dto/update-budget-status.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { BudgetItemType, BudgetStatus } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(status?: BudgetStatus, clientId?: string) {
    return this.prisma.budget.findMany({
      where: { status: status ?? undefined, clientId: clientId ?? undefined },
      include: { client: true, vehicle: { include: { brand: true, model: true } }, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { client: true, vehicle: { include: { brand: true, model: true } }, items: { include: { service: true } } },
    });
    if (!budget) {
      throw new NotFoundException('Orcamento nao encontrado');
    }
    return budget;
  }

  async create(dto: CreateBudgetDto, user: AuthenticatedUser, ip?: string) {
    const budget = await this.prisma.budget.create({
      data: {
        clientId: dto.clientId,
        vehicleId: dto.vehicleId,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        discount: dto.discount ?? 0,
        notes: dto.notes,
        items: {
          create: dto.items.map((i) => ({
            type: i.type,
            serviceId: i.serviceId,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    await this.audit.log({ user, action: 'CREATE', entity: 'Budget', entityId: budget.id, after: budget, ip });
    return budget;
  }

  async updateStatus(id: string, dto: UpdateBudgetStatusDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);

    if (before.status === BudgetStatus.CONVERTED) {
      throw new BadRequestException('Orcamento ja convertido em OS, nao pode mudar de status');
    }

    const budget = await this.prisma.budget.update({ where: { id }, data: { status: dto.status } });
    await this.audit.log({ user, action: 'UPDATE', entity: 'Budget', entityId: id, before, after: budget, ip });
    return budget;
  }

  /**
   * Converte um orcamento aprovado em uma Ordem de Servico. Itens tipo SERVICE
   * viram order_services, itens tipo PART viram order_items (pecas, sem
   * controle de estoque).
   */
  async convertToOrder(id: string, user: AuthenticatedUser, ip?: string) {
    const budget = await this.findOne(id);

    if (budget.status === BudgetStatus.CONVERTED) {
      throw new BadRequestException('Orcamento ja foi convertido em uma OS');
    }
    if (!budget.vehicleId) {
      throw new BadRequestException('Orcamento precisa ter um veiculo vinculado para virar OS');
    }

    const serviceItems = budget.items.filter((i) => i.type === BudgetItemType.SERVICE);
    const partItems = budget.items.filter((i) => i.type === BudgetItemType.PART);

    const servicesTotal = serviceItems.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
    const partsTotal = partItems.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          clientId: budget.clientId,
          vehicleId: budget.vehicleId!,
          notes: `Convertido do orcamento ${budget.id}`,
          servicesTotal,
          partsTotal,
          orderServices: {
            create: serviceItems
              .filter((i) => i.serviceId)
              .map((i) => ({ serviceId: i.serviceId!, price: Number(i.unitPrice) * i.quantity })),
          },
          orderItems: {
            create: partItems.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
          },
        },
      });

      await tx.budget.update({
        where: { id: budget.id },
        data: { status: BudgetStatus.CONVERTED, convertedOrderId: createdOrder.id },
      });

      return createdOrder;
    });

    await this.audit.log({ user, action: 'UPDATE', entity: 'Budget', entityId: budget.id, before: budget, after: { convertedOrderId: order.id }, ip });
    await this.audit.log({ user, action: 'CREATE', entity: 'Order', entityId: order.id, after: order, ip });

    return order;
  }
}
