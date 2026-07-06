import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { VehicleCatalogModule } from './vehicle-catalog/vehicle-catalog.module';
import { OilChangesModule } from './oil-changes/oil-changes.module';
import { MechanicsModule } from './mechanics/mechanics.module';
import { OperatorsModule } from './operators/operators.module';
import { ServiceCatalogModule } from './services/service-catalog.module';
import { OrdersModule } from './orders/orders.module';
import { BudgetsModule } from './budgets/budgets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { CommissionsModule } from './commissions/commissions.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    ClientsModule,
    VehiclesModule,
    VehicleCatalogModule,
    OilChangesModule,
    MechanicsModule,
    OperatorsModule,
    ServiceCatalogModule,
    OrdersModule,
    BudgetsModule,
    DashboardModule,
    FinanceiroModule,
    CommissionsModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
