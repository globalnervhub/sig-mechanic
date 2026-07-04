import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ServiceCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.service.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Servico nao encontrado');
    }
    return service;
  }

  async create(dto: CreateServiceDto, user: AuthenticatedUser, ip?: string) {
    const service = await this.prisma.service.create({ data: dto });
    await this.audit.log({ user, action: 'CREATE', entity: 'Service', entityId: service.id, after: service, ip });
    return service;
  }

  async update(id: string, dto: UpdateServiceDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    const service = await this.prisma.service.update({ where: { id }, data: dto });
    await this.audit.log({ user, action: 'UPDATE', entity: 'Service', entityId: id, before, after: service, ip });
    return service;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    await this.prisma.service.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'Service', entityId: id, before, ip });
    return { success: true };
  }
}
