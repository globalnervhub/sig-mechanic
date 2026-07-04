#!/usr/bin/env bash
# Deploy do SIG-Mechanic no servidor a partir do repositorio Git.
# Idempotente: pode ser executado repetidas vezes.
#
# Uso (no servidor, dentro de /opt/sig-mechanic):
#   ./scripts/server/deploy.sh
#
# Pressupostos:
# - O diretorio /opt/sig-mechanic e um checkout git do repositorio (branch main).
# - Os arquivos apps/backend/.env e apps/frontend/.env ja existem e NAO sao
#   versionados (contem segredos) - preservados entre deploys.
# - PM2 ja gerencia os processos "sig-mechanic-backend" e "sig-mechanic-frontend"
#   (ver scripts/server/ecosystem.config.js).

set -euo pipefail

cd "$(dirname "$0")/../.."
REPO_ROOT="$(pwd)"

echo "== [1/6] Atualizando codigo (git pull) =="
git pull --ff-only origin main

echo "== [2/6] Instalando dependencias (backend + frontend) =="
npm install --workspace=apps/backend
npm install --workspace=apps/frontend

echo "== [3/6] Aplicando migrations do Prisma =="
npm run prisma:generate --workspace=apps/backend
npx --workspace=apps/backend prisma migrate deploy

echo "== [4/6] Buildando backend =="
npm run build --workspace=apps/backend

echo "== [5/6] Buildando frontend =="
npm run build --workspace=apps/frontend

echo "== [6/6] Reiniciando processos PM2 =="
pm2 restart sig-mechanic-backend sig-mechanic-frontend
pm2 save

echo ""
echo "================ Deploy concluido =================="
echo "Commit atual: $(git rev-parse --short HEAD)"
echo "======================================================"
