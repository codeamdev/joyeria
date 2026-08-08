#!/bin/bash
set -e
cd /srv/joyeria

echo "→ Bajando cambios..."
git pull origin main

echo "→ Instalando dependencias..."
npm ci

echo "→ Aplicando migraciones..."
npx prisma migrate deploy

echo "→ Compilando..."
npm run build

echo "→ Reiniciando servicio..."
systemctl restart joyeria.service

echo "✅ Deploy completado - $(date)"
