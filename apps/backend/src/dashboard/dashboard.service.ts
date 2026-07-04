import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { OrderStatus } from '@prisma/client';

const OPEN_STATUSES: OrderStatus[] = [
  OrderStatus.OPEN,
  OrderStatus.WAITING_PARTS,
  OrderStatus.IN_PROGRESS,
  OrderStatus.WAITING_CLIENT,
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      osOpenCount,
      osDoneCount,
      newClientsCount,
      vehiclesCount,
      ordersDoneToday,
      ordersDoneThisMonth,
      servicesThisMonth,
    ] = await Promise.all([
      this.prisma.order.count({ where: { status: { in: OPEN_STATUSES } } }),
      this.prisma.order.count({ where: { status: OrderStatus.DONE } }),
      this.prisma.client.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.vehicle.count(),
      this.prisma.order.findMany({
        where: { status: OrderStatus.DONE, closedAt: { gte: startOfDay } },
        select: { partsTotal: true, servicesTotal: true },
      }),
      this.prisma.order.findMany({
        where: { status: OrderStatus.DONE, closedAt: { gte: startOfMonth } },
        select: { partsTotal: true, servicesTotal: true },
      }),
      this.prisma.orderService.findMany({
        where: { order: { status: OrderStatus.DONE, closedAt: { gte: startOfMonth } } },
        select: { price: true, mechanic: { select: { commissionPercent: true } } },
      }),
    ]);

    const sumOrders = (orders: { partsTotal: any; servicesTotal: any }[]) =>
      orders.reduce((sum, o) => sum + Number(o.partsTotal) + Number(o.servicesTotal), 0);

    const dailyRevenue = sumOrders(ordersDoneToday);
    const monthlyRevenue = sumOrders(ordersDoneThisMonth);

    const pendingCommissions = servicesThisMonth.reduce((sum, s) => {
      const pct = s.mechanic?.commissionPercent ? Number(s.mechanic.commissionPercent) : 0;
      return sum + (Number(s.price) * pct) / 100;
    }, 0);

    return {
      osOpen: osOpenCount,
      osDone: osDoneCount,
      dailyRevenue,
      monthlyRevenue,
      pendingCommissions,
      servicesPerformedThisMonth: servicesThisMonth.length,
      newClientsThisMonth: newClientsCount,
      vehiclesRegistered: vehiclesCount,
    };
  }
}
