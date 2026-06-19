# Painel do Lojista

Projeto desenvolvido como **desafio tecnico full-stack** para entregar um **MVP de gestao de loja** com autenticacao, controle de acesso, cadastro de usuarios e produtos, estoque, caixa e fluxo de vendas.

Este repositorio deve ser lido como um **desafio tecnico/MVP**, nao como produto pronto para producao. Os requisitos funcionais originais estao em [`DESAFIO.md`](./DESAFIO.md).

## Objetivo do projeto

Demonstrar implementacao ponta a ponta de um painel de lojista com:

- autenticacao com JWT e refresh token;
- autorizacao por perfil;
- CRUD de usuarios e produtos;
- controle de estoque;
- abertura de caixa;
- carrinho de vendas e fechamento de venda;
- integracao entre frontend, backend e banco de dados.

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, MySQL
- Frontend: Next.js App Router, React, React Hook Form, Zod, Tailwind CSS, shadcn/ui
- Infra local: Docker Compose, Adminer, Makefile

## Estrutura

```text
.
├── back-painel/        # API, Prisma, regras de negocio e testes
├── front-painel/       # Aplicacao web em Next.js
├── docker-compose.yml  # Stack local com MySQL, Adminer, backend e frontend
├── Makefile            # Comandos de desenvolvimento
├── DESAFIO.md          # Especificacao do desafio tecnico
├── ENVIRONMENT.md      # Referencia de variaveis de ambiente
└── LICENSE             # Licenca MIT
```

## Como rodar

### Requisitos

- Docker
- Docker Compose
- Make
- Node.js 20+ apenas se quiser rodar apps manualmente fora do Docker

### Configuracao

1. Copie os arquivos de exemplo para `.env`:

```bash
cp .env.example .env
cp back-painel/.env.example back-painel/.env
cp front-painel/.env.example front-painel/.env
```

2. Ajuste os segredos e conexoes conforme seu ambiente, principalmente:

- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `CORS_ORIGINS`
- `BACKEND_URL`

3. Suba a stack:

```bash
make run-dev
```

Alternativa direta:

```bash
docker compose up --build
```

### Servicos locais

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Adminer: `http://localhost:8080`

## Credenciais de demo

Se o banco for populado com o seed de desenvolvimento do backend, as credenciais de demo sao:

- Admin: `admin@painel.com` / `123456`
- Vendedor: `joao@painel.com` / `123456`

Essas credenciais existem para avaliacao local do desafio e nao devem permanecer como padrao em ambientes reais.

## Comandos principais

```bash
make run-dev
make down-dev
make format
make format-check
make lint
make build
make test
```

## Documentacao complementar

- [`DESAFIO.md`](./DESAFIO.md): escopo e criterios do desafio
- [`ENVIRONMENT.md`](./ENVIRONMENT.md): variaveis de ambiente do projeto
- [`back-painel/README.md`](./back-painel/README.md): detalhes do backend
- [`front-painel/README.md`](./front-painel/README.md): detalhes do frontend
