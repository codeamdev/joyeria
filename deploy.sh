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

# El servicio corre como el usuario "joyeria" (no root). Si este script se
# ejecuta como root (git/npm necesitan la llave SSH de root hacia GitHub),
# hay que devolverle la propiedad de todo o el on-demand revalidation
# (revalidatePath) falla en silencio con EACCES al escribir la caché.
echo "→ Corrigiendo permisos..."
chown -R joyeria:joyeria /srv/joyeria

echo "→ Reiniciando servicio..."
systemctl restart joyeria.service

echo "✅ Deploy completado - $(date)"
