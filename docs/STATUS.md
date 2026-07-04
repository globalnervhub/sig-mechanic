# Status do Desenvolvimento — SIG-Mechanic

> Atualize este arquivo ao final de cada sessao de trabalho (autopilot ou manual).

## Ultima Atualizacao

2026-07-04

## Fase Atual

**MVP inicial em producao (dev server)** — auth + RBAC + modulo de Clientes
funcionando end-to-end, deployado e acessivel via Nginx no servidor de
desenvolvimento (`http://192.168.1.202/`).

## Concluido

- [x] Especificacao funcional completa em `SIG-Mechanic.md`
- [x] Definicao de stack 100% TypeScript (NestJS + Next.js + Prisma)
- [x] Acesso SSH ao servidor de desenvolvimento configurado (chave ed25519)
- [x] Diagnostico do servidor (Debian 13, 4 vCPU, 8GB RAM, LXC, apenas nginx instalado)
- [x] Extracao do dicionario de dados do sistema legado (`docs/LEGACY-DATA-DICTIONARY.md`)
- [x] Mapeamento de migracao legado -> novo schema (`docs/MIGRATION-MAPPING.md`)
- [x] `AGENTS.md` criado com diretrizes para desenvolvimento autonomo
- [x] Stack provisionada no servidor: Node.js 20, PostgreSQL 17, Redis 8,
      MinIO, Nginx, PM2 (`scripts/server/provision.sh`, idempotente)
- [x] Monorepo criado (`apps/backend` NestJS, `apps/frontend` Next.js)
- [x] `schema.prisma` inicial (users, roles, permissions, clients, vehicles,
      mechanics, operators, services, orders, order_services, audit_logs)
- [x] Migration inicial aplicada no banco (`apps/backend/prisma/migrations/`)
- [x] Seed inicial: roles (Administrador/Operador), permissoes granulares
      (modulo.acao), usuario admin (`admin@sig-mechanic.local` / ver seed)
- [x] Autenticacao JWT + Guards de RBAC granular (`PermissionsGuard`)
- [x] Modulo de Clientes completo (CRUD + auditoria) — fatia vertical de referencia
- [x] Frontend: login, dashboard shell, listagem de clientes (Next.js App Router)
- [x] Deploy no servidor via PM2 (backend :3001, frontend :3000)
- [x] Nginx configurado como reverse proxy unico (porta 80): `/api/*` -> backend,
      `/*` -> frontend (`scripts/server/nginx/sig-mechanic.conf`)
- [x] PM2 configurado para iniciar no boot (`pm2 save` + `pm2 startup systemd`)
- [x] Validado end-to-end via curl: login retorna JWT com permissoes, listagem e
      criacao de clientes funcionando com auditoria

## Em Andamento / Proximos Passos (ordem sugerida)

1. [ ] Criar reposit orio no GitHub e concluir o push (ver bloqueio abaixo)
2. [ ] Tela de login real integrada com redirecionamento pos-auth + guarda de rotas no frontend
3. [ ] Modulo de Veiculos (API + tela), vinculado a Clientes
4. [ ] Modulo de Servicos, Mecanicos, Operadores (telas de cadastro)
5. [ ] Ordem de Servico e Orcamento (MVP) — fluxo completo do Roadmap
6. [ ] Popular roles adicionais e tela de gestao de usuarios/permissoes
7. [ ] HTTPS no Nginx (Let's Encrypt ou certificado interno) antes de expor externamente
8. [ ] Pipeline de deploy (`scripts/server/deploy.sh`) para automatizar
      build + restart PM2 a cada atualizacao de codigo
9. [ ] Iniciar importacao de dados do legado seguindo `docs/MIGRATION-MAPPING.md`

## Bloqueios / Pontos em Aberto

- **GitHub:** o remoto `https://github.com/globalnervhub/sig-mechanic.git` esta
  configurado, mas o repositorio **nao existe** (push retornou "Repository not
  found" e a URL publica retorna 404). O commit inicial ja foi feito localmente
  (branch `main`). Acao necessaria do usuario: criar o repositorio vazio em
  `github.com/globalnervhub/sig-mechanic` (sem README/license, para nao
  conflitar com o commit local) e entao rodar `git push -u origin main`.
- Formato de importacao do "novo sistema alimentador" (mencionado pelo
  usuario) ainda nao foi detalhado — a integracao de importacao continua
  usando como base `docs/MIGRATION-MAPPING.md` (legado DOS) ate que o novo
  formato seja especificado.
- Decidir se `clientes.dbf` e `clientev.dbf` sao fontes duplicadas/backup ou
  se ambas precisam ser mescladas na migracao.
- Servidor exposto apenas em HTTP (porta 80) na rede local — sem HTTPS ainda
  (ok para fase de desenvolvimento/testes).

## Notas de Ambiente

- Servidor dev: `192.168.1.202` (root, chave SSH configurada — ver
  `/memories/repo/servidor-desenvolvimento-info.md`)
- App acessivel em: `http://192.168.1.202/` (frontend) e `http://192.168.1.202/api` (backend)
- Deploy atual em: `/opt/sig-mechanic` no servidor (copiado via scp, fora do
  fluxo git ate o repositorio remoto ser criado)
- Usuario admin (seed): `admin@sig-mechanic.local` / `ChangeMe123!` — **alterar
  apos primeiro login**
- Repositorio GitHub: `https://github.com/globalnervhub/sig-mechanic.git` (a criar)
- Sem Docker no servidor — instalacao direta dos servicos (ver `AGENTS.md`)
