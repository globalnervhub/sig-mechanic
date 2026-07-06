import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.module';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { name: 'asc' },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissionCodes: role.permissions.map((rp) => rp.permission.code).sort(),
    }));
  }

  // Lista todos os codigos de permissao existentes, agrupados por modulo
  // (prefixo antes do primeiro ponto), para montar a matriz de checkboxes no frontend.
  async findAvailablePermissions() {
    const permissions = await this.prisma.permission.findMany({ orderBy: { code: 'asc' } });
    const grouped = new Map<string, string[]>();
    for (const perm of permissions) {
      const [module] = perm.code.split('.');
      const list = grouped.get(module) ?? [];
      list.push(perm.code);
      grouped.set(module, list);
    }
    return Array.from(grouped.entries()).map(([module, codes]) => ({ module, codes }));
  }

  async create(dto: CreateRoleDto, user: AuthenticatedUser, ip?: string) {
    try {
      const role = await this.prisma.role.create({
        data: { name: dto.name, description: dto.description },
      });

      if (dto.permissionCodes?.length) {
        await this.setPermissions(role.id, dto.permissionCodes);
      }

      await this.audit.log({ user, action: 'CREATE', entity: 'Role', entityId: role.id, after: role, ip });
      return this.findOne(role.id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe um papel com este nome');
      }
      throw err;
    }
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException('Papel nao encontrado');
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissionCodes: role.permissions.map((rp) => rp.permission.code).sort(),
    };
  }

  async update(id: string, dto: UpdateRoleDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    try {
      const role = await this.prisma.role.update({ where: { id }, data: dto });
      await this.audit.log({ user, action: 'UPDATE', entity: 'Role', entityId: id, before, after: role, ip });
      return this.findOne(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Ja existe um papel com este nome');
      }
      throw err;
    }
  }

  async updatePermissions(id: string, dto: UpdateRolePermissionsDto, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    await this.setPermissions(id, dto.permissionCodes);
    const after = await this.findOne(id);
    await this.audit.log({ user, action: 'UPDATE', entity: 'RolePermissions', entityId: id, before, after, ip });
    return after;
  }

  private async setPermissions(roleId: string, permissionCodes: string[]) {
    const permissions = await this.prisma.permission.findMany({ where: { code: { in: permissionCodes } } });
    if (permissions.length !== new Set(permissionCodes).size) {
      const found = new Set(permissions.map((p) => p.code));
      const missing = permissionCodes.filter((c) => !found.has(c));
      throw new BadRequestException(`Codigos de permissao invalidos: ${missing.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
      }),
    ]);
  }

  async remove(id: string, user: AuthenticatedUser, ip?: string) {
    const before = await this.findOne(id);
    if (before.userCount > 0) {
      throw new ConflictException('Nao e possivel excluir: existem usuarios com este papel atribuido');
    }
    await this.prisma.role.delete({ where: { id } });
    await this.audit.log({ user, action: 'DELETE', entity: 'Role', entityId: id, before, ip });
    return { success: true };
  }
}
