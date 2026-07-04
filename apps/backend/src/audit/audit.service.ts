import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

interface AuditParams {
  user?: AuthenticatedUser;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT_LEGACY';
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditParams) {
    await this.prisma.auditLog.create({
      data: {
        userId: params.user?.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        before: params.before as any,
        after: params.after as any,
        ip: params.ip,
      },
    });
  }
}
