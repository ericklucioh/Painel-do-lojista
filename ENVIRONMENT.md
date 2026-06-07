# Environment Map

Central reference for the runtime instances in this repository.

## Instances

- Root / Docker Compose
- `back-painel`
- `front-painel`

## 1. Root / Docker Compose

Purpose:

- Orchestrates the full local stack
- Provides MySQL, Adminer, backend, and frontend service wiring

Files:

- [`.env.example`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/.env.example)
- [`docker-compose.yml`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/docker-compose.yml)

Variables:

- `TZ`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_ROOT_PASSWORD`
- `ADMINER_PORT`
- `DATABASE_URL`
- `DATABASE_URL_DOCKER`
- `SHADOW_DATABASE_URL`
- `SHADOW_DATABASE_URL_DOCKER`

Notes:

- `DATABASE_URL_DOCKER` and `SHADOW_DATABASE_URL_DOCKER` are used by the backend container.
- `DATABASE_URL` and `SHADOW_DATABASE_URL` are host variants for manual runs outside Docker.

## 2. `back-painel`

Purpose:

- API runtime
- Prisma datasource configuration
- JWT and cookie configuration

Files:

- [`back-painel/.env.example`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/.env.example)
- [`back-painel/src/config/env.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/config/env.ts)
- [`back-painel/src/config/prisma.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/config/prisma.ts)
- [`back-painel/prisma.config.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/prisma.config.ts)

Variables:

- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `ACCESS_TOKEN_COOKIE_NAME`
- `AUTH_COOKIE_NAME`
- `DATABASE_URL`
- `DATABASE_URL_DOCKER`
- `SHADOW_DATABASE_URL`
- `DOCKER_DEV`
- `NODE_ENV`
- `PORT`

Notes:

- `DOCKER_DEV=true` prevents local dotenv overrides inside Docker.
- `PORT` defaults to `3001` when not provided.
- `AUTH_COOKIE_NAME` is the refresh token cookie name in the current codebase.
- `DATABASE_URL` must use `mysql://` or `mariadb://`.

## 3. `front-painel`

Purpose:

- Web app runtime
- Server-side proxy to the backend
- Auth/session handling for the browser app

Files:

- [`front-painel/.env.example`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/front-painel/.env.example)
- [`front-painel/src/lib/auth-config.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/front-painel/src/lib/auth-config.ts)
- [`front-painel/src/lib/backend-proxy.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/front-painel/src/lib/backend-proxy.ts)
- [`front-painel/middleware.ts`](/home/erick/code/projs/PAINEL-DO-LOJISTA-/front-painel/middleware.ts)

Variables:

- `BACKEND_URL`
- `NEXT_PUBLIC_API_URL`
- `NODE_ENV`

Notes:

- `BACKEND_URL` is the preferred value for server-side calls.
- `NEXT_PUBLIC_API_URL` is the fallback when `BACKEND_URL` is not set.
- If neither is set, the code falls back to `http://localhost:3001`.
- For Vercel, `BACKEND_URL` must point to the deployed API.

## Recommended Local Setup

- Root `.env` for compose and infrastructure values used by `make run-dev`
- `back-painel/.env` for backend secrets and Prisma runtime when running outside Docker
- `front-painel/.env` or Vercel project env vars for the frontend API URL when running outside Docker

## Recommended Deploy Setup

- Backend host:
  - `DATABASE_URL`
  - `SHADOW_DATABASE_URL`
  - `JWT_SECRET`
  - `REFRESH_TOKEN_SECRET`
  - `ACCESS_TOKEN_COOKIE_NAME`
  - `AUTH_COOKIE_NAME`
- Frontend host:
  - `BACKEND_URL`
  - optional `NEXT_PUBLIC_API_URL`

## Source Of Truth

This file is the single place to check environment responsibilities across the repository.
