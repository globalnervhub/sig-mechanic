import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Guard de RBAC granular. Deve ser usado depois de JwtAuthGuard.
 * Le as permissoes exigidas via @RequirePermissions(...) e compara com as
 * permissoes do usuario autenticado (carregadas no payload do JWT).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario nao autenticado');
    }

    const hasAll = required.every((perm) => user.permissions?.includes(perm));
    if (!hasAll) {
      throw new ForbiddenException('Permissao insuficiente para esta acao');
    }

    return true;
  }
}
