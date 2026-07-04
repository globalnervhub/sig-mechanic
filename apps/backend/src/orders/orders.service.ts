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

    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        notes: dto.notes ?? undefined,
        closedAt: isClosing ? new Date() : null,
      },
    });

    await this.audit.log({ user, action: 'UPDATE', entity: 'Order', entityId: id, before, after: order, ip });
    return order;
  }
}
