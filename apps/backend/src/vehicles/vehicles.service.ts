import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string, clientId?: string) {
    return this.prisma.vehicle.findMany({
      where: {
        clientId: clientId ?? undefined,
        OR: search
          ? [{ plate: { contains: search, mode: 'insensitive' } }, { brand: { contains: search, mode: 'insensitive' } }, { model: { contains: search, mode: 'insensitive' } }]
          : undefined,
      },
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!vehicle) {
      throw new NotFoundException('Veiculo nao encontrado');
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto, user: AuthenticatedUser, ip?: string) {
    const vehicle = await this.prisma.vehicle.create({ data: dto });
    await this.audit.log({ user, action: 'CREATE', entity: 'Vehicle', entityId: vehicle.id, after: vehicle, ip });
    return vehicle;
  }

  async update(id: string, dto: UpdateVehicleDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    const vehicle = await this.prisma.vehicle.update({ where: { id }, data: dto });
    await this.audit.log({ user, action: 'UPDATE', entity: 'Vehicle', entityId: id, before, after: vehicle, ip });
    return vehicle;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'Vehicle', entityId: id, before, ip });
    return { success: true };
  }
}
