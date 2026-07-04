#!/usr/bin/env bash
# Provisionamento base do servidor SIG-Mechanic (Debian 13 / LXC)
# Idempotente: pode ser executado novamente sem quebrar o ambiente.
#
# Uso (como root):
#   PGSQL_PASSWORD=... MINIO_ROOT_PASSWORD=... ./provision.sh
# Se as senhas nao forem informadas, senhas aleatorias sao geradas e
# exibidas ao final (guarde-as em local seguro, ex.: cofre de segredos).
#
# Instala, sem Docker/containers: Node.js LTS, PostgreSQL, Redis, MinIO,
# Nginx (reverse proxy) e PM2 (gerenciador de processos Node).

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script precisa ser executado como root." >&2
  exit 1
fi

PGSQL_PASSWORD="${PGSQL_PASSWORD:-$(openssl rand -hex 16)}"
MINIO_ROOT_PASSWORD="${MINIO_ROOT_PASSWORD:-$(openssl rand -hex 16)}"
MINIO_ROOT_USER="${MINIO_ROOT_USER:-sigmechanic}"
DB_NAME="${DB_NAME:-sigmechanic}"
DB_USER="${DB_USER:-sigmechanic}"

echo "== [1/6] Atualizando indice de pacotes =="
apt-get update -qq

echo "== [2/6] Instalando pacotes base (Node.js, PostgreSQL, Redis, Nginx, ferramentas) =="
apt-get install -y --no-install-recommends \
  nodejs npm \
  postgresql postgresql-contrib \
  redis-server \
  nginx \
  git curl ca-certificates gnupg openssl \
  build-essential

echo "== [3/6] Instalando PM2 (gerenciador de processos Node) =="
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
else
  echo "PM2 ja instalado, pulando."
fi

echo "== [4/6] Instalando MinIO (S3-compativel) =="
if ! id -u minio-user >/dev/null 2>&1; then
  useradd -r -s /sbin/nologin minio-user
fi

if [ ! -f /usr/local/bin/minio ]; then
  curl -fsSL https://dl.min.io/server/minio/release/linux-amd64/minio -o /usr/local/bin/minio
  chmod +x /usr/local/bin/minio
else
  echo "Binario do MinIO ja presente, pulando download."
fi

mkdir -p /var/lib/minio/data
chown -R minio-user:minio-user /var/lib/minio

if [ ! -f /etc/default/minio ]; then
  cat > /etc/default/minio <<EOF
MINIO_VOLUMES="/var/lib/minio/data"
MINIO_OPTS="--address :9000 --console-address :9001"
MINIO_ROOT_USER=${MINIO_ROOT_USER}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
EOF
  chmod 600 /etc/default/minio
else
  echo "/etc/default/minio ja existe, mantendo configuracao atual."
fi

cat > /etc/systemd/system/minio.service <<'EOF'
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
User=minio-user
Group=minio-user
EnvironmentFile=/etc/default/minio
ExecStart=/usr/local/bin/minio server $MINIO_OPTS $MINIO_VOLUMES
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

echo "== [5/6] Habilitando e iniciando servicos =="
systemctl daemon-reload
systemctl enable --now postgresql
systemctl enable --now redis-server
systemctl enable --now nginx
systemctl enable --now minio

echo "== [6/6] Criando role e banco de dados da aplicacao (se nao existirem) =="
if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  runuser -u postgres -- psql -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${PGSQL_PASSWORD}';"
else
  echo "Role ${DB_USER} ja existe, mantendo senha atual."
fi

if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  runuser -u postgres -- psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
else
  echo "Banco ${DB_NAME} ja existe, pulando."
fi

echo ""
echo "================ Provisionamento concluido ================"
node -v
npm -v
psql --version
redis-server --version
nginx -v
/usr/local/bin/minio --version
echo "=============================================================="
echo "DB_NAME=${DB_NAME}"
echo "DB_USER=${DB_USER}"
echo "PGSQL_PASSWORD=${PGSQL_PASSWORD}   (guarde em local seguro)"
echo "MINIO_ROOT_USER=${MINIO_ROOT_USER}"
echo "MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}   (guarde em local seguro)"
echo "=============================================================="
