import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: any;
  let audit: any;

  const user: AuthenticatedUser = {
    userId: 'user-1',
    email: 'admin@sig-mechanic.local',
    roleId: 'role-1',
    permissions: ['clientes.criar', 'clientes.editar', 'clientes.excluir', 'clientes.visualizar'],
  };

  beforeEach(() => {
    prisma = {
      client: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    audit = { log: jest.fn() };
    service = new ClientsService(prisma, audit);
  });

  it('lista clientes sem filtro de busca', async () => {
    prisma.client.findMany.mockResolvedValue([{ id: '1', name: 'Cliente A' }]);
    const result = await service.findAll();
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
    expect(result).toHaveLength(1);
  });

  it('lanca NotFoundException quando cliente nao existe', async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    await expect(service.findOne('inexistente')).rejects.toThrow(NotFoundException);
  });

  it('cria cliente e grava log de auditoria', async () => {
    const created = { id: '1', name: 'Novo Cliente' };
    prisma.client.create.mockResolvedValue(created);

    const result = await service.create({ type: 'PF', name: 'Novo Cliente' } as any, user, '127.0.0.1');

    expect(prisma.client.create).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entity: 'Client', entityId: '1' }),
    );
    expect(result).toEqual(created);
  });

  it('atualiza cliente e grava log de auditoria com before/after', async () => {
    const before = { id: '1', name: 'Antigo' };
    const after = { id: '1', name: 'Atualizado' };
    prisma.client.findUnique.mockResolvedValue(before);
    prisma.client.update.mockResolvedValue(after);

    const result = await service.update('1', { name: 'Atualizado' } as any, user, '127.0.0.1');

    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UPDATE', before, after }),
    );
    expect(result).toEqual(after);
  });

  it('remove cliente e grava log de auditoria', async () => {
    const before = { id: '1', name: 'Cliente' };
    prisma.client.findUnique.mockResolvedValue(before);
    prisma.client.delete.mockResolvedValue(before);

    const result = await service.remove('1', user, '127.0.0.1');

    expect(prisma.client.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'DELETE', before }));
    expect(result).toEqual({ success: true });
  });
});
