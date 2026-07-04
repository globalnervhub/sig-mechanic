# AGENTS.md — Guia de Desenvolvimento Autonomo do SIG-Mechanic

> Este arquivo instrui qualquer agente de IA (autopilot) que continue o
> desenvolvimento deste projeto em sessoes futuras. Leia-o por completo antes
> de escrever qualquer codigo. Mantenha-o atualizado conforme o projeto evolui.

## Objetivo do Projeto

Construir um ERP completo e funcional para oficina mecanica (SIG-Mechanic),
substituindo um sistema legado em DOS/Clipper. Especificacao funcional
completa em [SIG-Mechanic.md](./SIG-Mechanic.md) (raiz do repo) — leia-a
primeiro para entender modulos, regras de negocio e escopo.

**Meta final:** sistema em producao, rodando no servidor de desenvolvimento
(que serve de modelo para o LXC de producao), com codigo versionado no GitHub.

---

## Stack Tecnologica (definida, nao alterar sem justificativa forte)

Stack 100% TypeScript — decisao deliberada porque o projeto e desenvolvido
integralmente por IA (ver [SIG-Mechanic.md](./SIG-Mechanic.md#stack-tecnológica)):

- **Frontend:** Next.js (App Router) + TypeScript + TailwindCSS
- **Backend:** NestJS + TypeScript (estrutura modular: Controllers, Services, Guards, DTOs)
- **ORM:** Prisma + PostgreSQL
- **Cache/Filas:** Redis + BullMQ
- **Storage:** MinIO (S3-compatible)
- **Servidor:** Linux (Debian 13), Nginx como reverse proxy, Node.js via PM2 (systemd)
- **Sem Docker/containers dentro do servidor de desenvolvimento** — o proprio
  servidor ja e um LXC, que sera clonado/replicado para producao. Instalar
  tudo diretamente (bare-metal dentro do LXC), sem uma camada extra de
  containers. Motivo: simplicidade operacional e menor overhead nesta fase.

## Regras Gerais de Desenvolvimento

1. **Monorepo** em `apps/frontend` (Next.js) e `apps/backend` (NestJS), com
   `packages/shared` para tipos/DTOs compartilhados. Ver estrutura completa
   em [SIG-Mechanic.md](./SIG-Mechanic.md#estrutura-do-projeto).
2. **RBAC granular** (ex.: `clientes.criar`, `clientes.editar`) — implementar
   via Guards do NestJS + tabela `permissions`/`roles` no Prisma.
3. **Auditoria obrigatoria**: toda alteracao relevante (create/update/delete)
   deve gravar em `audit_logs` (quem, quando, IP, antes, depois).
4. **Autenticacao JWT**, sessao via refresh token.
5. **Nao implementar controle de estoque** — dados de produtos/precos vem do
   SIV-NG (integracao futura). Ver [SIG-Mechanic.md](./SIG-Mechanic.md#integração-com-siv-ng).
6. **Migracao de dados legados**: ver [docs/LEGACY-DATA-DICTIONARY.md](./docs/LEGACY-DATA-DICTIONARY.md)
   e [docs/MIGRATION-MAPPING.md](./docs/MIGRATION-MAPPING.md) para o mapeamento
   completo das tabelas DBF do sistema DOS. A pasta `sistema/` contem os
   arquivos `.DBF` originais (nao commitar dados sensiveis de clientes reais
   sem anonimizacao caso o repositorio seja tornado publico).
7. **Testes**: cobrir regras de negocio criticas (comissao, financeiro, RBAC)
   com testes automatizados (Jest no backend).
8. **Commits pequenos e frequentes**, mensagens descritivas, sempre em
   TypeScript com tipagem estrita (`strict: true` no tsconfig).

## Convencoes de Codigo

- Nomes de tabelas/colunas no Prisma: `snake_case` no banco via `@map`,
  `camelCase` no TypeScript (padrao Prisma).
- DTOs de entrada/saida validados com `class-validator` (NestJS) e
  compartilhados com o frontend via `packages/shared` quando possivel.
- Endpoints REST seguem o padrao ja definido em
  [SIG-Mechanic.md](./SIG-Mechanic.md#api) (`/api/clientes`, `/api/veiculos`, etc.).

---

## Servidor de Desenvolvimento

- **Host:** `192.168.1.202` (rede local), usuario `root`.
- **SO:** Debian GNU/Linux 13 (trixie), 4 vCPUs, 8GB RAM, LXC (Proxmox).
- **Acesso:** SSH por chave (`~/.ssh/id_ed25519` configurado) ou senha (ver
  `/memories/repo/servidor-desenvolvimento-info.md` para detalhes — nao expor
  credenciais em arquivos do repositorio).
- **Este servidor e o modelo/gabarito**: os scripts de provisionamento em
  `scripts/server/` devem ser suficientes para recriar o ambiente do zero em
  outro LXC (para produção/comercialização futura).
- Scripts de provisionamento devem ser **idempotentes** (podem rodar de novo
  sem quebrar nada).

## Repositorio GitHub

- Remoto: `https://github.com/globalnervhub/sig-mechanic.git`
- Branch principal: `main`
- Toda a documentacao, scripts de infraestrutura e codigo do produto devem
  estar versionados aqui. Nao commitar segredos (senhas, `.env` reais) — usar
  `.env.example`.

---

## Estado Atual / Progresso

Ver [docs/STATUS.md](./docs/STATUS.md) para o estado atual do desenvolvimento,
o que ja foi feito e os proximos passos priorizados. **Atualize esse arquivo
ao final de cada sessao de trabalho.**

## Como Continuar o Desenvolvimento (Autopilot)

1. Leia [SIG-Mechanic.md](./SIG-Mechanic.md) (especificacao) e
   [docs/STATUS.md](./docs/STATUS.md) (progresso atual).
2. Verifique o Backlog Inicial e o Roadmap (MVP → v1.0 → v1.5 → v2.0) em
   [SIG-Mechanic.md](./SIG-Mechanic.md#backlog-inicial) para saber a proxima
   entrega de maior valor.
3. Implemente em fatias verticais completas (ex.: "Cadastro de Clientes"
   completo — model Prisma + API NestJS + tela Next.js + testes — antes de
   passar ao proximo modulo), nao camadas horizontais incompletas.
4. Ao terminar uma fatia, atualize `docs/STATUS.md` e o checklist em
   [SIG-Mechanic.md](./SIG-Mechanic.md#checklist-de-desenvolvimento).
5. Faça commit e push para o GitHub ao final de cada etapa estavel.
