# Status do Desenvolvimento — SIG-Mechanic

> Atualize este arquivo ao final de cada sessao de trabalho (autopilot ou manual).

## Ultima Atualizacao

2026-07-04

## Fase Atual

**Fundacao / Infraestrutura** — ainda nao ha codigo de produto (backend/frontend).

## Concluido

- [x] Especificacao funcional completa em `SIG-Mechanic.md`
- [x] Definicao de stack 100% TypeScript (NestJS + Next.js + Prisma)
- [x] Acesso SSH ao servidor de desenvolvimento configurado (chave ed25519)
- [x] Diagnostico do servidor (Debian 13, 4 vCPU, 8GB RAM, LXC, apenas nginx instalado)
- [x] Extracao do dicionario de dados do sistema legado (`docs/LEGACY-DATA-DICTIONARY.md`)
- [x] Mapeamento de migracao legado -> novo schema (`docs/MIGRATION-MAPPING.md`)
- [x] `AGENTS.md` criado com diretrizes para desenvolvimento autonomo

## Em Andamento / Proximos Passos (ordem sugerida)

1. [ ] Provisionar stack base no servidor: Node.js LTS, PostgreSQL, Redis, MinIO
      (scripts em `scripts/server/`)
2. [ ] Criar estrutura do monorepo (`apps/backend` NestJS, `apps/frontend` Next.js,
      `packages/shared`)
3. [ ] Definir `schema.prisma` inicial cobrindo: users, roles, permissions,
      clients, vehicles, mechanics, operators, services, orders (MVP do
      Roadmap em SIG-Mechanic.md)
4. [ ] Implementar autenticacao JWT + RBAC basico (guards, decorators)
5. [ ] Implementar modulo de Clientes completo (API + tela) como primeira
      fatia vertical de referencia
6. [ ] Implementar modulo de Veiculos
7. [ ] Implementar modulo de Servicos, Mecanicos, Operadores
8. [ ] Implementar Ordem de Servico e Orcamento (MVP)
9. [ ] Deploy continuo no servidor de desenvolvimento (PM2 + Nginx)
10. [ ] Commit/push continuo para GitHub (`globalnervhub/sig-mechanic`)

## Bloqueios / Pontos em Aberto

- Formato de importacao do "novo sistema alimentador" (mencionado pelo
  usuario) ainda nao foi detalhado — a integracao de importacao continua
  usando como base `docs/MIGRATION-MAPPING.md` (legado DOS) ate que o novo
  formato seja especificado.
- Decidir se `clientes.dbf` e `clientev.dbf` sao fontes duplicadas/backup ou
  se ambas precisam ser mescladas na migracao.

## Notas de Ambiente

- Servidor dev: `192.168.1.202` (root, chave SSH configurada — ver
  `/memories/repo/servidor-desenvolvimento-info.md`)
- Repositorio GitHub: `https://github.com/globalnervhub/sig-mechanic.git`
- Sem Docker no servidor — instalacao direta dos servicos (ver `AGENTS.md`)
