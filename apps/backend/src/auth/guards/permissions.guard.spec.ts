import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

function buildContext(user: unknown): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  let reflector: Reflector;
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('permite acesso quando o endpoint nao exige permissoes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = buildContext({ permissions: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite acesso quando o usuario possui todas as permissoes exigidas', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['clientes.criar']);
    const context = buildContext({ permissions: ['clientes.criar', 'clientes.visualizar'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('nega acesso quando falta alguma permissao exigida', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['clientes.excluir']);
    const context = buildContext({ permissions: ['clientes.visualizar'] });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('nega acesso quando nao ha usuario autenticado no request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['clientes.visualizar']);
    const context = buildContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
