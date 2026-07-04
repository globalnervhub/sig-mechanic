import { PrismaClient, ClientType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSION_MODULES = ['clientes', 'veiculos', 'servicos', 'mecanicos', 'operadores', 'os', 'orcamentos', 'financeiro'];
const PERMISSION_ACTIONS = ['criar', 'editar', 'excluir', 'visualizar'];

async function main() {
  // 1. Permissoes granulares (modulo.acao)
  const permissionCodes: string[] = [];
  for (const module of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      permissionCodes.push(`${module}.${action}`);
    }
  }

  const permissions = await Promise.all(
    permissionCodes.map((code) =>
      prisma.permission.upsert({
        where: { code },
        update: {},
        create: { code },
      }),
    ),
  );

  // 2. Roles basicos
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: { name: 'Administrador', description: 'Acesso total ao sistema' },
  });

  await prisma.role.upsert({
    where: { name: 'Operador' },
    update: {},
    create: { name: 'Operador', description: 'Atendimento e cadastros basicos' },
  });

  // Administrador recebe todas as permissoes
  await Promise.all(
    permissions.map((perm) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id },
      }),
    ),
  );

  // 3. Usuario admin inicial
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@sig-mechanic.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
    },
  });

  // 4. Cliente de exemplo (para validar o modulo)
  await prisma.client.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      type: ClientType.PF,
      name: 'Cliente Exemplo',
      phone: '(00) 00000-0000',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed concluido.');
  // eslint-disable-next-line no-console
  console.log(`Usuario admin: ${adminEmail} / senha: ${adminPassword} (ALTERE apos o primeiro login)`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
