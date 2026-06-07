# back-painel

API do Painel do Lojista em Node.js, Express e Prisma.

Este app concentra autenticação, usuários, produtos, estoque, caixa e vendas.

## Fluxo Principal

Este backend foi projetado para ser executado junto com o resto da stack via Docker.
O caminho oficial do repositório é subir tudo com:

```bash
make run-dev
```

Se você quiser rodar o backend isoladamente, faça isso só como exceção para desenvolvimento local ou troubleshooting.

## Requisitos

- Node.js 20+
- npm
- MySQL 8.0 para ambiente local ou Docker

## Configuração de Ambiente

Arquivo de exemplo:

- [`.env.example`](./.env.example)

Variáveis principais:

- `DATABASE_URL`
- `DATABASE_URL_DOCKER`
- `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_EXPIRES_IN`
- `ACCESS_TOKEN_COOKIE_NAME`
- `AUTH_COOKIE_NAME`
- `RECEIPT_PRINTER_MODE`
- `RECEIPT_PRINTER_HOST`
- `RECEIPT_PRINTER_PORT`
- `RECEIPT_PRINTER_TIMEOUT_MS`

## Instalação

```bash
npm install
cp .env.example .env
```

Se você for rodar localmente sem Docker, ajuste `DATABASE_URL` e `SHADOW_DATABASE_URL` para o MySQL da sua máquina.

## Scripts

- `npm run dev` - inicia a API em modo watch.
- `npm run build` - compila TypeScript; o Prisma client é gerado antes do build.
- `npm run start` - executa o build gerado em `dist/`.
- `npm run lint` - executa ESLint.
- `npm run lint:fix` - aplica correções automáticas do ESLint.
- `npm run format` - formata o código.
- `npm run format:check` - valida a formatação.
- `npm run prisma:generate` - gera o Prisma client para o banco principal.
- `npm run prisma:migrate:deploy` - aplica migrations no banco principal.
- `npm run prisma:seed` - popula o banco principal com dados iniciais.
- `npm run prisma:test:generate` - gera o Prisma client usado nos testes.
- `npm run prisma:test:reset` - recria e popula a base de teste.
- `npm run test` - prepara a base de teste e executa a suíte.
- `npm run test:run` - mesma preparação, executando a suíte em modo run.
- `npm run test:watch` - mesma preparação, executando a suíte em watch.

Esses scripts são internos ao backend.
No fluxo oficial do repositório, a suíte é acionada pelo comando raiz `make test`.

## Desenvolvimento Local

```bash
npm install
npm run prisma:generate
npm run dev
```

Se o banco já estiver provisionado, você também pode aplicar migrations e seed antes de subir a API:

```bash
npm run prisma:migrate:deploy
npm run prisma:seed
```

## Docker

Quando usado pelo fluxo principal do repositório, o backend sobe via Docker Compose e usa as variáveis `DATABASE_URL_DOCKER` e `SHADOW_DATABASE_URL_DOCKER`.
Não é necessário executar `npm run dev` para usar o projeto como demonstração.

## Testes

Os testes usam uma base SQLite isolada em `/tmp` e um client Prisma próprio para o ambiente de teste.

Fluxo esperado:

1. `npm run prisma:test:generate`
2. `npm run prisma:test:reset`
3. `vitest`

Na prática, o comando raiz `make test` executa essa sequência dentro do Docker Compose.

## Observações

- A API concentra as regras de negócio e mantém os handlers finos.
- Prisma e validações Zod são usados de forma explícita e tipada.
- O modo de impressão de recibo pode ser configurado por ambiente para simulação ou integração com hardware.
