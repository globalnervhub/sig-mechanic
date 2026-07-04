# Provisionamento do Servidor - SIG-Mechanic

Scripts para provisionar o servidor de desenvolvimento (Debian 13 / LXC), que
serve como **modelo replicavel** para o ambiente de producao/comercializacao
futura.

## Filosofia

- Sem Docker/containers dentro do LXC — instalacao direta via `apt` e
  binarios oficiais. O proprio LXC ja fornece isolamento suficiente nesta
  fase; a stack roda "bare metal" dentro dele.
- Scripts **idempotentes**: podem ser executados novamente sem duplicar
  configuracao ou quebrar o que ja existe.

## O que e instalado

| Componente | Origem | Servico systemd |
|---|---|---|
| Node.js 20 LTS + npm | apt (repo Debian trixie) | — |
| PM2 | npm global | gerenciador de processos Node (configurar por app) |
| PostgreSQL 17 | apt (repo Debian trixie) | `postgresql` |
| Redis | apt (repo Debian trixie) | `redis-server` |
| MinIO | binario oficial (dl.min.io) | `minio` (systemd criado pelo script) |
| Nginx | apt (ja vem instalado na imagem) | `nginx` |

## Uso

```bash
# Copiar o script para o servidor
scp scripts/server/provision.sh root@192.168.1.202:/root/

# Executar (senhas aleatorias serao geradas se nao informadas)
ssh root@192.168.1.202 "chmod +x /root/provision.sh && /root/provision.sh"

# Ou definindo senhas especificas:
ssh root@192.168.1.202 "PGSQL_PASSWORD=minhasenha MINIO_ROOT_PASSWORD=outrasenha /root/provision.sh"
```

Ao final, o script exibe as credenciais geradas (PostgreSQL e MinIO). Guarde-as
em local seguro (cofre de segredos / variaveis de ambiente do servidor) — elas
**nao sao salvas no repositorio**.

## Replicando para um novo LXC (producao)

1. Criar um novo LXC Debian 13 (trixie) no Proxmox.
2. Copiar e executar `provision.sh` como root.
3. Configurar `.env` da aplicacao com as credenciais geradas.
4. Configurar Nginx (ver `scripts/server/nginx/`) e certificados HTTPS.
5. Fazer deploy do codigo (`apps/backend`, `apps/frontend`) via PM2.

## Deploy da aplicacao (`deploy.sh`)

A partir desta versao, o deploy e feito via **git**, nao mais copiando
arquivos manualmente por `scp`.

### Configuracao inicial (uma vez)

```bash
# No servidor, como root
git clone https://github.com/globalnervhub/sig-mechanic.git /opt/sig-mechanic
cd /opt/sig-mechanic

# Criar os .env (nao versionados) com as credenciais reais
nano apps/backend/.env    # ver apps/backend/.env.example
nano apps/frontend/.env   # ver apps/frontend/.env.example

# Primeira instalacao e build
npm install --workspace=apps/backend
npm install --workspace=apps/frontend
npm run prisma:generate --workspace=apps/backend
npx --workspace=apps/backend prisma migrate deploy
npm run build --workspace=apps/backend
npm run build --workspace=apps/frontend

# Subir com PM2 (ecosystem.config.js referencia caminhos absolutos)
pm2 start scripts/server/ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root
```

### Deploys seguintes (rotina)

```bash
ssh root@192.168.1.202 "cd /opt/sig-mechanic && ./scripts/server/deploy.sh"
```

O script `deploy.sh` faz `git pull`, reinstala dependencias se necessario,
aplica migrations pendentes do Prisma, rebuilda backend e frontend, e reinicia
os processos PM2. E idempotente e seguro de rodar repetidamente.

## Scripts disponiveis

- `provision.sh` — provisiona a stack base do zero (Node, PostgreSQL, Redis, MinIO, Nginx)
- `deploy.sh` — atualiza o codigo (git pull) e reconstroi/reinicia a aplicacao
- `ecosystem.config.js` — configuracao do PM2 para os dois processos (backend/frontend)
- `nginx/sig-mechanic.conf` — reverse proxy unico: `/api/*` -> backend, `/*` -> frontend
