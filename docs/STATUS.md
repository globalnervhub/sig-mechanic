# Status do Desenvolvimento — SIG-Mechanic

> Atualize este arquivo ao final de cada sessao de trabalho (autopilot ou manual).

## Ultima Atualizacao

2026-07-06 (sessao 2)

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
- [x] **Overhaul de UI do frontend (2026-07-06)**: `AppShell` reescrito de
      navbar superior para sidebar lateral com grupos de navegacao (Cadastros,
      Operacao, Financeiro, Administracao), responsivo (menu hamburguer +
      overlay no mobile), titulo dinamico da pagina no cabecalho. Criado
      sistema global de notificacoes `Toast` (`useToast()`, sucesso/erro/info,
      auto-dismiss) e componente `StatusBadge` (pill colorido padronizado para
      todos os status: ativo/inativo, status de OS, orcamento, contas a
      pagar/receber, comissao). Aplicado consistentemente em todas as
      paginas (Clientes, Veiculos, Mecanicos, Operadores, Servicos, OS,
      Orcamentos, Financeiro, Comissoes, Usuarios): titulos `<h1>` duplicados
      removidos (o cabecalho da sidebar ja exibe o titulo), busca com debounce
      (300ms) adicionada nas listagens de catalogo, linhas de tabela com
      hover, feedback de sucesso/erro via toast em todas as acoes de
      criar/editar/excluir/mudar status. Build e deploy validados no servidor
      sem erros (PM2 online, logs limpos)
- [x] **Cadastro de Marca/Modelo de veiculos (2026-07-06)**: novos models
      `VehicleBrand`/`VehicleModel` (migration `vehicle_catalog_oilchange`,
      com backfill automatico dos dados livres existentes). `Vehicle.brand`/
      `model` (texto livre) substituidos por `brandId`/`modelId` (FK).
      Backend: modulo `vehicle-catalog` (`/api/marcas`, `/api/modelos`, CRUD
      completo, reaproveita permissoes `veiculos.*`). Frontend: pagina
      `/marcas` (gerenciar marcas + modelos por marca) e formulario de
      Veiculos atualizado para selects em cascata (marca -> modelo) em vez
      de texto livre — elimina dados mockados/inconsistentes
- [x] **Controle de Troca de Oleo (2026-07-06)**: novo model
      `OilChangeRecord` (km atual, proxima troca por km e/ou data, tipo de
      oleo, observacoes, vinculo opcional a uma OS). Backend: modulo
      `oil-changes` (`/api/trocas-oleo`, `/api/trocas-oleo/veiculos` para a
      visao geral com a ultima troca de cada veiculo). Frontend: pagina
      `/trocas-oleo` com registro de novas trocas e historico completo por
      veiculo. Atualiza automaticamente `vehicle.currentKm` quando a nova
      leitura e maior que a registrada
- [x] **Gerenciamento de Papeis e Permissoes (2026-07-06)**: novo modulo
      `roles` (`/api/papeis`) permitindo criar papeis, listar permissoes
      disponiveis agrupadas por modulo, e editar a matriz de permissoes de
      cada papel (`PATCH /api/papeis/:id/permissoes`) sem precisar mexer no
      seed/banco diretamente. Frontend: pagina `/papeis` com matriz de
      checkboxes (modulo x acao) por papel. Bloqueia exclusao de papel com
      usuarios atribuidos
- [x] **Novos papeis padrao (2026-07-06)**: `Financeiro` (contas a
      pagar/receber, fluxo de caixa, comissoes + visualizacao de
      clientes/veiculos/OS/orcamentos/mecanicos) e `Vendas/Balcao`
      (clientes, veiculos, orcamentos, OS e trocas de oleo completos, mais
      criacao/visualizacao de usuarios, conforme perfil de atendimento no
      balcao) adicionados ao seed junto com os papeis existentes
      (Administrador, Operador)
- [x] **Busca dinamica de clientes (2026-07-06)**: novo componente
      `ClientAutocomplete` (busca por nome, CPF/CNPJ, telefone ou
      `legacyCode`, com debounce de 300ms) substitui os antigos `<select>`
      com todos os +5000 clientes pre-carregados nos formularios de
      Veiculos, Ordem de Servico e Orcamentos. Backend: busca de clientes
      agora tambem cobre `legacyCode` e limita resultados a 50 registros por
      consulta. Campo `legacyCode` (codigo do cliente no sistema legado)
      exposto no cadastro/listagem de Clientes
- [x] **Ferramenta de importacao do legado (2026-07-06)**: script
      `apps/backend/scripts/import-legacy.ts` (`npm run import:legacy`,
      suporta `--dry-run` e `--only=clientes|veiculos`) le `clientes.dbf` e
      `carros.dbf` (reconstruindo o vinculo cliente-veiculo via `ctr_os.dbf`,
      conforme `docs/MIGRATION-MAPPING.md`) e importa de forma idempotente
      (upsert por `legacyCode`/placa). **Ainda NAO testado com os arquivos
      .DBF reais** (nao presentes neste ambiente/servidor no momento) —
      rodar `--dry-run` primeiro assim que os arquivos estiverem disponiveis
      em `sistema/`. Ainda nao cobre Ordens de Servico/financeiro (proxima
      etapa, mesmo padrao)

## Em Andamento / Proximos Passos (ordem sugerida)

1. [ ] Relatorios formais (exportacao/impressao em PDF) — v1.5 do Roadmap
2. [ ] Edicao/exclusao no frontend para Ordem de Servico e Orcamentos (hoje
       criacao + conversao + mudanca de status; falta editar itens ja criados)
3. [ ] Cadastro de Bancos/Contas Bancarias (spec menciona, ainda nao
       implementado — Financeiro hoje trata contas a pagar/receber sem
       vincular a uma conta bancaria especifica)
4. [ ] Ampliar cobertura de testes automatizados (financeiro, comissoes,
       orders, vehicle-catalog, oil-changes, roles, e2e)
5. [ ] HTTPS no Nginx (Let's Encrypt ou certificado interno) antes de expor externamente
6. [ ] Rodar a ferramenta de importacao (`import:legacy`) com os arquivos
       .DBF reais assim que disponiveis (comecar com `--dry-run`), depois
       estender o script para Ordens de Servico (`lan_pec.dbf`/`lan_ser.dbf`)
       e financeiro (`contas_p.dbf`/`contas_r.dbf`) seguindo o mesmo padrao
7. [ ] Uploads de arquivos (fotos, PDFs, comprovantes) via MinIO — provisionado
       no servidor mas ainda nao integrado ao codigo da aplicacao
8. [ ] **Antes de ir para producao:** remover o componente `DevNotice` e seus
       usos em `login/page.tsx` e `usuarios/page.tsx` (avisos de credenciais
       de desenvolvimento) — ver secao "Concluido" acima para detalhes
9. [ ] Revisar/ajustar os conjuntos de permissoes padrao dos papeis
       `Financeiro` e `Vendas/Balcao` (definidos por inferencia nesta sessao)
       usando a nova tela `/papeis` conforme o uso real da equipe

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
- Deploy atual em: `/opt/sig-mechanic` no servidor, checkout git da branch
  `main` (`origin` = `https://github.com/globalnervhub/sig-mechanic.git`).
  Para atualizar: `git push` local + `ssh root@192.168.1.202 "cd /opt/sig-mechanic && ./scripts/server/deploy.sh"`
  (idempotente: git pull + npm install + prisma migrate deploy + build + pm2 restart)
- Node/npm NAO estao instalados na maquina Windows local de desenvolvimento —
  builds e testes do frontend/backend so podem ser validados no servidor
  (via deploy.sh) ou rodando `npm run build`/`npm test` remotamente por SSH
- Repositorio GitHub: `https://github.com/globalnervhub/sig-mechanic` (ativo,
  branch `main` publicado)
- Usuario admin (seed): `admin@sig-mechanic.local` / `ChangeMe123!` — **alterar
  apos primeiro login**
- Sem Docker no servidor — instalacao direta dos servicos (ver `AGENTS.md`)
