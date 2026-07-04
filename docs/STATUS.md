# Status do Desenvolvimento — SIG-Mechanic

> Atualize este arquivo ao final de cada sessao de trabalho (autopilot ou manual).

## Ultima Atualizacao

2026-07-04

## Fase Atual

**v1.0 do Roadmap concluida em producao (dev server)** — alem do MVP completo
(Login, Clientes, Veiculos, Servicos, Mecanicos, Operadores, OS, Orcamentos),
agora tambem: Financeiro (contas a pagar/receber + fluxo de caixa), Comissao
(ledger automatico gerado ao finalizar OS), gestao de Usuarios/Roles, e
Dashboard com indicadores reais. CRUD completo, guarda de rotas, testes
automatizados e deploy via git com pipeline proprio. Deployado e acessivel
via Nginx no servidor de desenvolvimento (`http://192.168.1.202/`).

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
- [x] Schema expandido: `OrderItem` (pecas na OS, sem controle de estoque),
      `Budget`/`BudgetItem` (orcamentos com itens de peca/servico)
      (migration `mvp_modules`)
- [x] Backend: modulos completos (CRUD + RBAC + auditoria) para Veiculos,
      Mecanicos, Operadores, Servicos (catalogo)
- [x] Backend: Ordem de Servico (`/api/os`) — criacao com servicos+pecas,
      calculo automatico de totais, transicao de status (`PATCH /:id/status`)
- [x] Backend: Orcamentos (`/api/orcamentos`) — criacao com itens, mudanca de
      status, e conversao para OS (`POST /:id/converter`, transacional)
- [x] Frontend: paginas de listagem para Veiculos, Servicos, Mecanicos,
      Operadores, OS e Orcamentos + navegacao atualizada no dashboard
- [x] Testado end-to-end via curl: criar servico/mecanico/operador/veiculo,
      abrir OS com pecas+servicos, criar orcamento e converte-lo em OS
- [x] Build + deploy completo no servidor (backend e frontend rebuildados,
      PM2 reiniciado, todas as rotas retornando 200 via Nginx)
- [x] Guarda de rotas no frontend (`AppShell` redireciona para `/login` sem
      sessao; `apiFetch` desloga automaticamente em 401) + navbar com logout
- [x] Formularios de criacao no frontend para Clientes, Veiculos, Mecanicos,
      Operadores, Servicos, Ordem de Servico (servicos+pecas dinamicos) e
      Orcamentos (itens dinamicos + botao "Converter em OS")
- [x] Deploy migrado de `scp` manual para **git-based**: servidor agora roda
      um checkout git de `/opt/sig-mechanic` (branch `main`); criado
      `scripts/server/deploy.sh` (git pull + install + migrate + build +
      restart PM2, idempotente) — ver `scripts/server/README.md`
- [x] Cutover validado: login, listagem e dados existentes preservados apos
      a migracao do deploy scp -> git
- [x] `deploy.sh` executado e validado de ponta a ponta pela primeira vez
      (git pull + install + testes + migrate + build + restart PM2)
- [x] Backend: endpoint `/api/dashboard` com indicadores reais (OS abertas/
      finalizadas, receita diaria/mensal, comissoes pendentes estimadas,
      servicos realizados no mes, clientes novos no mes, veiculos cadastrados)
- [x] Frontend: Dashboard consumindo indicadores reais (cards de KPI)
- [x] CRUD completo no frontend (criar + editar + excluir) para Clientes,
      Veiculos, Mecanicos, Operadores e Servicos
- [x] Testes automatizados (Jest) para `PermissionsGuard` (RBAC) e
      `ClientsService` (9 testes, todos passando) — primeiro passo do
      checklist de Qualidade
- [x] Housekeeping: `package-lock.json` versionado (build reprodutivel),
      `next-env.d.ts` no `.gitignore`
- [x] Validado end-to-end pos-deploy: dashboard retornando dados reais,
      criar/editar/excluir cliente via API (PATCH e DELETE confirmados com 404
      apos exclusao)
- [x] Schema expandido (migration `financeiro_comissoes`): `Payable`,
      `Receivable`, `Commission`
- [x] Backend: modulo Financeiro (`/api/financeiro/pagar`,
      `/api/financeiro/receber`) — criar conta, marcar como paga/recebida,
      e `/api/financeiro/fluxo-caixa` com saldo consolidado (entradas -
      saidas liquidadas)
- [x] Backend: Comissao automatica — ao finalizar uma OS (`status=DONE`), um
      registro de comissao e criado para cada servico com mecanico atribuido
      (`amount = preco * commissionPercent / 100`), idempotente (upsert por
      `orderServiceId`). Endpoint `/api/comissoes` para listar e marcar como paga
- [x] Dashboard atualizado para usar o ledger real de comissoes pendentes
      (antes era uma estimativa calculada; agora soma `Commission` com
      `status=PENDING`)
- [x] Backend: gestao de Usuarios (`/api/usuarios`) — listar, criar (com
      hash de senha e role), ativar/desativar; `/api/usuarios/roles` para
      listar papeis disponiveis. Nova permissao granular `usuarios.*`
      adicionada ao seed
- [x] Frontend: paginas Financeiro (contas a pagar/receber + saldo),
      Comissoes (listar + marcar como paga) e Usuarios (listar + criar +
      ativar/desativar)
- [x] Frontend: mudanca de status da OS diretamente na listagem (select por
      linha, chama `PATCH /api/os/:id/status`)
- [x] Testado end-to-end via curl: conta a pagar criada e paga, conta a
      receber criada, fluxo de caixa com saldo correto, OS finalizada
      gerando comissao automaticamente (valor calculado corretamente),
      usuario novo criado com role atribuida
- [x] Limpeza: backup do deploy antigo (`/opt/sig-mechanic-scp-backup`,
      744MB) removido do servidor apos varias execucoes estaveis do
      `deploy.sh` git-based
- [x] Frontend validado ponta-a-ponta via navegador real (login, navegacao
      entre todos os modulos, edicao inline, dados reais renderizados em
      todas as paginas) — nenhum bug de aplicacao encontrado
- [x] Traducao de status no Financeiro ("Em aberto"/"Paga"/"Recebida" em vez
      dos valores brutos do enum) + validacao client-side de senha (min. 6
      caracteres) no formulario de Usuarios
- [x] Avisos visuais de desenvolvimento adicionados (componente `DevNotice`)
      abaixo do formulario de Login e do formulario de criacao de Usuarios,
      mostrando as credenciais padrao (`admin@sig-mechanic.local` /
      `ChangeMe123!`) e limitacoes atuais (sem fluxo de troca/recuperacao de
      senha). **ATENCAO:** remover o componente `DevNotice` e todos os seus
      usos (`apps/frontend/src/components/DevNotice.tsx` e imports em
      `login/page.tsx` e `usuarios/page.tsx`) antes de qualquer uso em
      producao — feito deliberadamente enquanto o sistema ainda esta em
      ambiente de desenvolvimento/testes

## Em Andamento / Proximos Passos (ordem sugerida)

1. [ ] Relatorios formais (exportacao/impressao em PDF) — v1.5 do Roadmap
2. [ ] Edicao/exclusao no frontend para Ordem de Servico e Orcamentos (hoje
       criacao + conversao + mudanca de status; falta editar itens ja criados)
3. [ ] Cadastro de Bancos/Contas Bancarias (spec menciona, ainda nao
       implementado — Financeiro hoje trata contas a pagar/receber sem
       vincular a uma conta bancaria especifica)
4. [ ] Ampliar cobertura de testes automatizados (financeiro, comissoes,
       orders, e2e)
5. [ ] HTTPS no Nginx (Let's Encrypt ou certificado interno) antes de expor externamente
6. [ ] Importacao dos dados do sistema legado seguindo `docs/MIGRATION-MAPPING.md`
       (aguardando definicao do formato do novo sistema alimentador)
7. [ ] Uploads de arquivos (fotos, PDFs, comprovantes) via MinIO — provisionado
       no servidor mas ainda nao integrado ao codigo da aplicacao
8. [ ] **Antes de ir para producao:** remover o componente `DevNotice` e seus
       usos em `login/page.tsx` e `usuarios/page.tsx` (avisos de credenciais
       de desenvolvimento) — ver secao "Concluido" acima para detalhes

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
