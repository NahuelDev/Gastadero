# Gastadero

Aplicación para gestionar gastos compartidos entre grupos de personas. Permite registrar gastos, dividirlos entre miembros, calcular balances y registrar pagos de deudas.

## Features

- Crear grupos e invitar miembros mediante un link
- Registrar gastos con splits personalizados
- Calcular balances y deudas simplificadas automáticamente
- Registrar liquidaciones de deudas
- Subir comprobantes de gastos (imágenes/PDFs)
- Exportar reportes en PDF
- Compartir resumen por WhatsApp
- Interfaz en español e inglés

## Stack

| Capa | Tecnología |
|------|-----------|
| API | [Hono](https://hono.dev/) en Cloudflare Workers |
| Base de datos | Cloudflare D1 (SQLite) |
| Almacenamiento | Cloudflare R2 |
| ORM | Drizzle ORM |
| Frontend | React 19 + React Router 7 |
| Estilos | Tailwind CSS 4 |
| Estado servidor | TanStack Query 5 |
| Validación | Zod |
| Monorepo | pnpm workspaces |

## Estructura

```
gastos-compartidos/
├── apps/
│   ├── api/          # Cloudflare Worker (Hono + Drizzle + D1)
│   └── web/          # React SPA (Vite + Tailwind)
└── packages/
    └── shared/       # Tipos y schemas Zod compartidos
```

## Setup local

### Requisitos

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (se instala como dev dependency)

### Instalación

```bash
git clone https://github.com/tu-usuario/gastadero.git
cd gastadero
pnpm install
```

### Configurar variables de entorno

**API** — crear `apps/api/.dev.vars` a partir del ejemplo:

```bash
cp apps/api/.dev.vars.example apps/api/.dev.vars
# Editar .dev.vars y completar JWT_SECRET con un valor seguro
```

**Frontend** — crear `apps/web/.env.local` a partir del ejemplo:

```bash
cp apps/web/.env.example apps/web/.env.local
# VITE_API_URL ya apunta a localhost:8787 por defecto
```

### Base de datos local

```bash
# Aplicar migraciones en D1 local
pnpm db:migrate
```

### Levantar el proyecto

```bash
# API + Web en paralelo
pnpm dev

# O por separado
pnpm dev:api   # http://localhost:8787
pnpm dev:web   # http://localhost:5173
```

## Deploy

### API (Cloudflare Workers)

```bash
# Configurar el secreto JWT en producción (solo la primera vez)
cd apps/api && npx wrangler secret put JWT_SECRET

# Aplicar migraciones en D1 remota (solo cuando hay nuevas migraciones)
pnpm --filter @gastos/api db:migrate:prod

# Deployar
pnpm --filter @gastos/api deploy
```

### Frontend (Cloudflare Pages)

```bash
cd apps/web
VITE_API_URL=https://gastadero-api.nahuelclotet.com.ar npx vite build
npx wrangler pages deploy dist --project-name gastos-web
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Levanta API y frontend en paralelo |
| `pnpm dev:api` | Solo la API |
| `pnpm dev:web` | Solo el frontend |
| `pnpm build` | Build completo del monorepo |
| `pnpm typecheck` | Verifica tipos en todos los packages |
| `pnpm db:generate` | Genera migraciones de Drizzle |
| `pnpm db:migrate` | Aplica migraciones en D1 local |

## Variables de entorno

### `apps/api/.dev.vars` (desarrollo local)

| Variable | Descripción |
|----------|-------------|
| `JWT_SECRET` | Secreto para firmar los tokens JWT |

En producción, esta variable se configura como secreto de Cloudflare Workers con `wrangler secret put JWT_SECRET`.

### `apps/web/.env.local`

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8787` |
