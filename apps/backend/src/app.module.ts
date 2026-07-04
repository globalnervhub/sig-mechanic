import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { MechanicsModule } from './mechanics/mechanics.module';
import { OperatorsModule } from './operators/operators.module';
import { ServiceCatalogModule } from './services/service-catalog.module';
import { OrdersModule } from './orders/orders.module';
import { BudgetsModule } from './budgets/budgets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    ClientsModule,
    VehiclesModule,
    MechanicsModule,
    OperatorsModule,
    ServiceCatalogModule,
    OrdersModule,
    BudgetsModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
