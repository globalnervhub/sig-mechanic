import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class OperatorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findAll(search?: string) {
    return this.prisma.operator.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const operator = await this.prisma.operator.findUnique({ where: { id } });
    if (!operator) {
      throw new NotFoundException('Operador nao encontrado');
    }
    return operator;
  }

  async create(dto: CreateOperatorDto, user: AuthenticatedUser, ip?: string) {
    const operator = await this.prisma.operator.create({ data: dto });
    await this.audit.log({ user, action: 'CREATE', entity: 'Operator', entityId: operator.id, after: operator, ip });
    return operator;
  }

  async update(id: string, dto: UpdateOperatorDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    const operator = await this.prisma.operator.update({ where: { id }, data: dto });
    await this.audit.log({ user, action: 'UPDATE', entity: 'Operator', entityId: id, before, after: operator, ip });
    return operator;
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    await this.prisma.operator.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'Operator', entityId: id, before, ip });
    return { success: true };
  }
}
