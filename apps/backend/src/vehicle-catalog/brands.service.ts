import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.vehicleBrand.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.vehicleBrand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca nao encontrada');
    return brand;
  }

  async create(dto: CreateBrandDto, user: AuthenticatedUser, ip?: string) {
    try {
      const brand = await this.prisma.vehicleBrand.create({ data: dto });
      await this.audit.log({ user, action: 'CREATE', entity: 'VehicleBrand', entityId: brand.id, after: brand, ip });
      return brand;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe uma marca com este nome');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateBrandDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    try {
      const brand = await this.prisma.vehicleBrand.update({ where: { id }, data: dto });
      await this.audit.log({ user, action: 'UPDATE', entity: 'VehicleBrand', entityId: id, before, after: brand, ip });
      return brand;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe uma marca com este nome');
      }
      throw err;
    }
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    try {
      await this.prisma.vehicleBrand.delete({ where: { id } });
      await this.audit.log({ user, action: 'DELETE', entity: 'VehicleBrand', entityId: id, before, ip });
      return { success: true };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
        throw new ConflictException('Nao e possivel excluir: existem modelos ou veiculos vinculados a esta marca');
      }
      throw err;
    }
  }
}
