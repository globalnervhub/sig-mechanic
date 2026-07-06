import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateOilChangeDto } from './dto/create-oil-change.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class OilChangesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(vehicleId?: string) {
    return this.prisma.oilChangeRecord.findMany({
      where: { vehicleId: vehicleId ?? undefined },
      include: {
        vehicle: { include: { client: true, brand: true, model: true } },
      },
      orderBy: { changeDate: 'desc' },
    });
  }

  // Lista o veiculo + a troca de oleo mais recente de cada um, para a tela
  // de acompanhamento (mostra quais estao proximos do km/data de vencimento).
  async findVehiclesOverview(search?: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: search
        ? {
            OR: [
              { plate: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        client: true,
        brand: true,
        model: true,
        oilChanges: { orderBy: { changeDate: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return vehicles.map((v) => ({
      id: v.id,
      plate: v.plate,
      currentKm: v.currentKm,
      client: v.client,
      brand: v.brand,
      model: v.model,
      lastOilChange: v.oilChanges[0] ?? null,
    }));
  }

  async create(dto: CreateOilChangeDto, user: AuthenticatedUser, ip?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
    if (!vehicle) throw new NotFoundException('Veiculo nao encontrado');

    const record = await this.prisma.oilChangeRecord.create({
      data: {
        vehicleId: dto.vehicleId,
        orderId: dto.orderId,
        changeDate: new Date(dto.changeDate),
        currentKm: dto.currentKm,
        nextChangeKm: dto.nextChangeKm,
        nextChangeDate: dto.nextChangeDate ? new Date(dto.nextChangeDate) : undefined,
        oilType: dto.oilType,
        notes: dto.notes,
      },
    });

    // Mantem o km atual do veiculo atualizado com o valor mais recente informado
    if (!vehicle.currentKm || dto.currentKm > vehicle.currentKm) {
      await this.prisma.vehicle.update({ where: { id: dto.vehicleId }, data: { currentKm: dto.currentKm } });
    }

    await this.audit.log({ user, action: 'CREATE', entity: 'OilChangeRecord', entityId: record.id, after: record, ip });
    return record;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.prisma.oilChangeRecord.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Registro de troca de oleo nao encontrado');
    await this.prisma.oilChangeRecord.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'OilChangeRecord', entityId: id, before, ip });
    return { success: true };
  }
}
