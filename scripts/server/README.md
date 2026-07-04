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

## Proximos scripts planejados

- `deploy.sh` — build e restart das aplicacoes via PM2
- `nginx/sig-mechanic.conf` — configuracao de reverse proxy para
  frontend (Next.js) e backend (NestJS)
