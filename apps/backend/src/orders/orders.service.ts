import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(status?: OrderStatus, clientId?: string) {
    return this.prisma.order.findMany({
      where: { status: status ?? undefined, clientId: clientId ?? undefined },
      include: { client: true, vehicle: true, orderServices: { include: { service: true, mechanic: true } }, orderItems: true },
      orderBy: { openedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { client: true, vehicle: true, orderServices: { include: { service: true, mechanic: true } }, orderItems: true },
    });
    if (!order) {
      throw new NotFoundException('Ordem de servico nao encontrada');
    }
    return order;
  }

  async create(dto: CreateOrderDto, user: AuthenticatedUser, ip?: string) {
    const services = dto.services ?? [];
    const items = dto.items ?? [];

    const servicesTotal = services.reduce((sum, s) => sum + s.price, 0);
    const partsTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

    const order = await this.prisma.order.create({
      data: {
        clientId: dto.clientId,
        vehicleId: dto.vehicleId,
        notes: dto.notes,
        servicesTotal,
        partsTotal,
        orderServices: {
          create: services.map((s) => ({ serviceId: s.serviceId, mechanicId: s.mechanicId, price: s.price })),
        },
        orderItems: {
          create: items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        },
      },
      include: { orderServices: true, orderItems: true },
    });

    await this.audit.log({ user, action: 'CREATE', entity: 'Order', entityId: order.id, after: order, ip });
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);

    const isClosing = dto.status === OrderStatus.DONE || dto.status === OrderStatus.CANCELLED;
    const isBecomingDone = dto.status === OrderStatus.DONE && before.status !== OrderStatus.DONE;

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes ?? undefined,
        closedAt: isClosing ? new Date() : null,
      },
    });

    if (isBecomingDone) {
      await this.generateCommissions(before);
    }

    await this.audit.log({ user, action: 'UPDATE', entity: 'Order', entityId: id, before, after: order, ip });
    return order;
  }

  /**
   * Cria os lancamentos de comissao (um por servico com mecanico atribuido)
   * quando a OS e finalizada. Idempotente: nao duplica se a OS for reaberta
   * e finalizada novamente (respeita a constraint unique em orderServiceId).
   */
  private async generateCommissions(order: {
    id: string;
    orderServices: { id: string; mechanicId: string | null; price: any }[];
  }) {
    const eligible = order.orderServices.filter((os) => os.mechanicId);
    if (eligible.length === 0) return;

    const mechanics = await this.prisma.mechanic.findMany({
      where: { id: { in: eligible.map((os) => os.mechanicId as string) } },
    });
    const mechanicById = new Map(mechanics.map((m) => [m.id, m]));

    for (const os of eligible) {
      const mechanic = mechanicById.get(os.mechanicId as string);
      const pct = mechanic?.commissionPercent ? Number(mechanic.commissionPercent) : 0;
      if (pct <= 0) continue;

      const amount = (Number(os.price) * pct) / 100;

      await this.prisma.commission.upsert({
        where: { orderServiceId: os.id },
        update: {},
        create: {
          mechanicId: os.mechanicId as string,
          orderId: order.id,
          orderServiceId: os.id,
          amount,
        },
      });
    }
  }
}
