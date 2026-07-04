import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateMechanicDto } from './dto/create-mechanic.dto';
import { UpdateMechanicDto } from './dto/update-mechanic.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class MechanicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.mechanic.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });
    if (!mechanic) {
      throw new NotFoundException('Mecanico nao encontrado');
    }
    return mechanic;
  }

  async create(dto: CreateMechanicDto, user: AuthenticatedUser, ip?: string) {
    const mechanic = await this.prisma.mechanic.create({
      data: { ...dto, admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : undefined },
    });
    await this.audit.log({ user, action: 'CREATE', entity: 'Mechanic', entityId: mechanic.id, after: mechanic, ip });
    return mechanic;
  }

  async update(id: string, dto: UpdateMechanicDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    const mechanic = await this.prisma.mechanic.update({
      where: { id },
      data: { ...dto, admissionDate: dto.admissionDate ? new Date(dto.admissionDate) : undefined },
    });
    await this.audit.log({ user, action: 'UPDATE', entity: 'Mechanic', entityId: id, before, after: mechanic, ip });
    return mechanic;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    await this.prisma.mechanic.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'Mechanic', entityId: id, before, ip });
    return { success: true };
  }
}
