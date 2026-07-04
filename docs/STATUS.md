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
- [x] Push para GitHub concluido — `cirobrandao` adicionado como colaborador
      com Write em `globalnervhub/sig-mechanic`; branch `main` publicado e
      rastreando `origin/main`

## Em Andamento / Proximos Passos (ordem sugerida)

1. [ ] Tela de login real integrada com redirecionamento pos-auth + guarda de rotas no frontend
2. [ ] Modulo de Veiculos (API + tela), vinculado a Clientes
3. [ ] Modulo de Servicos, Mecanicos, Operadores (telas de cadastro)
4. [ ] Ordem de Servico e Orcamento (MVP) — fluxo completo do Roadmap
5. [ ] Popular roles adicionais e tela de gestao de usuarios/permissoes
6. [ ] HTTPS no Nginx (Let's Encrypt ou certificado interno) antes de expor externamente
7. [ ] Pipeline de deploy (`scripts/server/deploy.sh`) para automatizar
      build + restart PM2 a cada atualizacao de codigo
8. [ ] Iniciar importacao de dados do legado seguindo `docs/MIGRATION-MAPPING.md`

## Bloqueios / Pontos em Aberto

- ~~GitHub: push negado por falta de permissao~~ **RESOLVIDO (2026-07-04)** —
  usuario adicionou `cirobrandao` como colaborador com Write em
  `globalnervhub/sig-mechanic`. Push concluido, branch `main` publicado e
  rastreando `origin/main`.
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
- Deploy atual em: `/opt/sig-mechanic` no servidor (copiado via scp; ainda nao
  ha pipeline automatico de `git pull` + deploy — proximo passo sugerido)
- Repositorio GitHub: `https://github.com/globalnervhub/sig-mechanic` (ativo,
  branch `main` publicado)
- Usuario admin (seed): `admin@sig-mechanic.local` / `ChangeMe123!` — **alterar
  apos primeiro login**
- Sem Docker no servidor — instalacao direta dos servicos (ver `AGENTS.md`)
