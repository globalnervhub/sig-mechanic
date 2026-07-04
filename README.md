# SIG-Mechanic

Sistema de Gestao para Oficinas Mecanicas. Ver especificacao completa em
[SIG-Mechanic.md](./SIG-Mechanic.md) e diretrizes de desenvolvimento autonomo
em [AGENTS.md](./AGENTS.md).

## Stack

- **Frontend:** Next.js + TypeScript + TailwindCSS (`apps/frontend`)
- **Backend:** NestJS + TypeScript + Prisma (`apps/backend`)
- **Banco:** PostgreSQL · **Cache/Filas:** Redis/BullMQ · **Storage:** MinIO

## Estrutura

```
apps/
  backend/    # API NestJS
  frontend/   # App Next.js
docs/
  LEGACY-DATA-DICTIONARY.md   # Estrutura das tabelas do sistema legado (DOS)
  MIGRATION-MAPPING.md        # Mapeamento legado -> novo schema
  STATUS.md                   # Estado atual do desenvolvimento
scripts/
  server/     # Provisionamento do servidor (sem Docker)
sistema/      # Dados do sistema legado (.DBF) - NAO versionado (.gitignore)
```

## Desenvolvimento local / no servidor

Pre-requisitos: Node.js 20+, PostgreSQL, Redis (ja provisionados no servidor
de desenvolvimento — ver `scripts/server/provision.sh`).

```bash
# Instalar dependencias (na raiz, workspaces npm)
npm install

# Configurar variaveis de ambiente
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Rodar migrations + seed inicial (roles, permissoes, usuario admin)
npm run prisma:migrate --workspace=apps/backend
npm run prisma:seed --workspace=apps/backend

# Subir backend (porta 3001) e frontend (porta 3000)
npm run dev:backend
npm run dev:frontend
```

Usuario admin padrao criado pelo seed: `admin@sig-mechanic.local` / `ChangeMe123!`
(defina `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` para customizar).

## Deploy no servidor de desenvolvimento

Ver [scripts/server/README.md](./scripts/server/README.md) para provisionamento
da infraestrutura. Deploy da aplicacao via PM2 (ver `docs/STATUS.md` para o
estado atual desse processo).
