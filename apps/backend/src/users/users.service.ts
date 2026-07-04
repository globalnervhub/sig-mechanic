import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { name: 'asc' },
    });
    return users.map(({ passwordHash, ...rest }) => rest);
  }

  findAllRoles() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' } });
  }

  async create(dto: CreateUserDto, user: AuthenticatedUser, ip?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Ja existe um usuario com este email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const created = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        roleId: dto.roleId,
        active: dto.active ?? true,
      },
      include: { role: true },
    });

    const { passwordHash: _omit, ...safeUser } = created;

    await this.audit.log({ user, action: 'CREATE', entity: 'User', entityId: created.id, after: safeUser, ip });
    return safeUser;
  }

  async update(id: string, dto: UpdateUserDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.prisma.user.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Usuario nao encontrado');

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    const { passwordHash: _b, ...beforeSafe } = before;
    const { passwordHash: _a, ...afterSafe } = updated;

    await this.audit.log({ user, action: 'UPDATE', entity: 'User', entityId: id, before: beforeSafe, after: afterSafe, ip });
    return afterSafe;
  }
}
