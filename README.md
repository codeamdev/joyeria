# Joyería y Platería AJ

Plataforma de galería premium para joyería artesanal: catálogo administrable, hero
configurable (video/carrusel), historia de marca, personalización por encargo y
contacto directo por WhatsApp — sin carrito ni pasarela de pago.

Stack: Next.js 16 (App Router) · TypeScript · PostgreSQL local · Prisma 7 (driver
adapters) · Auth.js v5 (credenciales) · Tailwind CSS v4 · Radix UI · dnd-kit · sharp.

## Requisitos

- Node.js 20.9+ (usado en desarrollo: Node 24)
- PostgreSQL accesible (local o remoto)

## Configuración local

1. Copiar variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Crear el rol de aplicación y la base de datos (con un usuario **superusuario**,
   una sola vez):

   ```sql
   CREATE DATABASE joyeria;
   CREATE ROLE joyeria_app LOGIN PASSWORD 'una-password-fuerte';
   GRANT ALL PRIVILEGES ON DATABASE joyeria TO joyeria_app;
   \c joyeria
   GRANT ALL ON SCHEMA public TO joyeria_app;
   ALTER DATABASE joyeria OWNER TO joyeria_app;
   -- Solo en DESARROLLO, para que `prisma migrate dev` pueda crear su shadow DB:
   ALTER ROLE joyeria_app CREATEDB;
   ```

   En producción **no** se necesita `CREATEDB`: las migraciones se aplican con
   `prisma migrate deploy`, que no usa shadow database.

3. Completar `DATABASE_URL`, `AUTH_SECRET` (generar con
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)
   y `UPLOADS_DIR` (carpeta **fuera** del repositorio) en `.env`.

4. Instalar dependencias, migrar y generar el cliente:

   ```bash
   npm install
   npx prisma migrate dev
   ```

5. Sembrar el primer usuario administrador y las categorías base:

   ```bash
   SEED_ADMIN_EMAIL=tu@correo.com SEED_ADMIN_PASSWORD='una-password-temporal-larga' npx tsx prisma/seed.ts
   ```

6. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Sitio público: http://localhost:3000 — Panel admin: http://localhost:3000/admin/login

## Estructura relevante

- `prisma/schema.prisma` — modelo de datos completo.
- `src/auth.ts` / `src/proxy.ts` — autenticación y protección de `/admin/*`.
- `src/lib/uploads.ts` + `src/app/media/[...path]/route.ts` — subida y servido de
  archivos (fuera del repo, con validación de MIME real y recompresión de imágenes).
- `src/app/admin/(protected)/*` — panel de administración (productos, categorías,
  hero, historia, configuración, solicitudes, usuarios, auditoría).
- `src/app/(public)/*` — sitio público (inicio, catálogo, producto, historia,
  personalización, contacto).

## Despliegue (servidor Linux compartido, sin Docker)

Desplegado en `/srv/joyeria`, sin contenedores, siguiendo el mismo patrón de
carpetas/git que los demás proyectos del servidor pero con proceso systemd
directo (decisión explícita: sin Docker).

1. **Base de datos**: rol `joyeria_app` + DB `joyeria` en el PostgreSQL local
   del servidor (puerto 5432, ya usado por otros proyectos), **sin**
   `CREATEDB` — las migraciones en producción usan `prisma migrate deploy`
   (no necesita shadow database).

2. **Código**: `git clone` del repo en `/srv/joyeria` (usuario dedicado
   `joyeria`, sin privilegios de root, dueño de esa carpeta y de
   `/srv/joyeria-uploads`, que vive **fuera** del árbol de la app).

3. **Variables de entorno**: `/srv/joyeria/.env.production` (600, dueño
   `joyeria`) — copiar también a `.env` porque `prisma.config.ts` sólo
   autocarga ese nombre. Incluye `DATABASE_URL`, `AUTH_SECRET`, `UPLOADS_DIR`,
   `AUTH_URL`, `PORT`.

4. **Proceso**: `systemd` (`/etc/systemd/system/joyeria.service`), corriendo
   como el usuario `joyeria`, con `ExecStart=next start -H 127.0.0.1 -p 3003`
   — el puerto **nunca** se expone directamente (además de no ser necesario,
   el firewall del proveedor cloud sólo permite 22/80/443 sin importar `ufw`).
   Sandboxing básico: `ProtectSystem=strict`, `NoNewPrivileges=true`,
   `ReadWritePaths` limitado a uploads y `.next/cache`.

5. **Nginx**: bloque en `/etc/nginx/sites-available/joyeria` con
   `server_name` igual a la IP del servidor (coincidencia exacta, no
   interfiere con los `server_name` por dominio de otros sitios), proxy a
   `127.0.0.1:3003`. Mientras no haya dominio propio queda en HTTP plano —
   con dominio, agregar bloque HTTPS vía certbot y redirigir 80→443 (y
   entonces si `AUTH_URL` pasa a `https://`, Auth.js activa la cookie
   `Secure` automáticamente).

6. **Redeploy**: `bash /srv/joyeria/deploy.sh` (git pull + npm ci + prisma
   migrate deploy + build + `systemctl restart joyeria`).
