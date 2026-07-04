import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.client.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { cpf: { contains: search } },
              { cnpj: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { vehicles: true },
    });
    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }
    return client;
  }

  async create(dto: CreateClientDto, user: AuthenticatedUser, ip?: string) {
    const client = await this.prisma.client.create({
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });

    await this.audit.log({
      user,
      action: 'CREATE',
      entity: 'Client',
      entityId: client.id,
      after: client,
      ip,
    });

    return client;
  }

  async update(id: string, dto: UpdateClientDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);

    const client = await this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });

    await this.audit.log({
      user,
      action: 'UPDATE',
      entity: 'Client',
      entityId: client.id,
      before,
      after: client,
      ip,
    });

    return client;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);

    await this.prisma.client.delete({ where: { id } });

    await this.audit.log({
      user,
      action: 'DELETE',
      entity: 'Client',
      entityId: id,
      before,
      ip,
    });

    return { success: true };
  }
}
