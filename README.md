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

## Despliegue en el servidor Linux (PostgreSQL local)

1. **Base de datos**: crear el rol/DB como en el paso 2 de arriba, **sin**
   `CREATEDB`. Configurar `pg_hba.conf` para exigir contraseña (`scram-sha-256`)
   en conexiones locales, y backups periódicos (`pg_dump` vía cron — no hay
   redundancia gestionada al ser una base local).

2. **Variables de entorno**: `DATABASE_URL`, `AUTH_SECRET`, `UPLOADS_DIR`
   (ej. `/var/lib/joyeria/uploads`, con permisos del usuario que corre la app) y
   `AUTH_URL=https://tu-dominio.com` — con URL en `https`, Auth.js activa
   automáticamente la cookie de sesión `Secure`.

3. **Build y arranque**:

   ```bash
   npm ci
   npx prisma migrate deploy
   npm run build
   npm run start   # o gestionado con systemd/PM2
   ```

4. **Reverse proxy (nginx)**: terminar TLS ahí y hacer proxy a `127.0.0.1:3000`.
   Si se suben videos grandes al hero, subir `client_max_body_size` en nginx
   (los Route Handlers de Next no imponen un límite propio, pero el proxy sí).

5. **Proceso persistente**: usar systemd o PM2 para reiniciar la app si cae, y
   habilitarlo en el arranque del servidor.
