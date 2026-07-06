import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ModelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(brandId?: string, search?: string) {
    return this.prisma.vehicleModel.findMany({
      where: {
        brandId: brandId ?? undefined,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      include: { brand: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.vehicleModel.findUnique({ where: { id }, include: { brand: true } });
    if (!model) throw new NotFoundException('Modelo nao encontrado');
    return model;
  }

  async create(dto: CreateModelDto, user: AuthenticatedUser, ip?: string) {
    try {
      const model = await this.prisma.vehicleModel.create({ data: dto });
      await this.audit.log({ user, action: 'CREATE', entity: 'VehicleModel', entityId: model.id, after: model, ip });
      return model;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe um modelo com este nome para esta marca');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateModelDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    try {
      const model = await this.prisma.vehicleModel.update({ where: { id }, data: dto });
      await this.audit.log({ user, action: 'UPDATE', entity: 'VehicleModel', entityId: id, before, after: model, ip });
      return model;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe um modelo com este nome para esta marca');
      }
      throw err;
    }
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    try {
      await this.prisma.vehicleModel.delete({ where: { id } });
      await this.audit.log({ user, action: 'DELETE', entity: 'VehicleModel', entityId: id, before, ip });
      return { success: true };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Nao e possivel excluir: existem veiculos vinculados a este modelo');
      }
      throw err;
    }
  }
}
