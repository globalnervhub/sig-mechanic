import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { OrderStatus, CommissionStatus } from '@prisma/client';

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
      servicesThisMonthCount,
      pendingCommissionsAgg,
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
      this.prisma.orderService.count({
        where: { order: { status: OrderStatus.DONE, closedAt: { gte: startOfMonth } } },
      }),
      this.prisma.commission.aggregate({
        where: { status: CommissionStatus.PENDING },
        _sum: { amount: true },
      }),
    ]);

    const sumOrders = (orders: { partsTotal: any; servicesTotal: any }[]) =>
      orders.reduce((sum, o) => sum + Number(o.partsTotal) + Number(o.servicesTotal), 0);

    const dailyRevenue = sumOrders(ordersDoneToday);
    const monthlyRevenue = sumOrders(ordersDoneThisMonth);
    const pendingCommissions = Number(pendingCommissionsAgg._sum.amount ?? 0);

    return {
      osOpen: osOpenCount,
      osDone: osDoneCount,
      dailyRevenue,
      monthlyRevenue,
      pendingCommissions,
      servicesPerformedThisMonth: servicesThisMonthCount,
      newClientsThisMonth: newClientsCount,
      vehiclesRegistered: vehiclesCount,
    };
  }
}
