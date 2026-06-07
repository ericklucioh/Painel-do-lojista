# back-painel

API do Painel do Lojista em Node.js, Express e Prisma.

Este app concentra autenticação, usuários, produtos, estoque, caixa e vendas.

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

## Testes

Os testes usam uma base SQLite isolada em `/tmp` e um client Prisma próprio para o ambiente de teste.

Fluxo esperado:

1. `npm run prisma:test:generate`
2. `npm run prisma:test:reset`
3. `vitest`

Na prática, os comandos `npm run test`, `npm run test:run` e `npm run test:watch` já executam essa sequência.

## Observações

- A API concentra as regras de negócio e mantém os handlers finos.
- Prisma e validações Zod são usados de forma explícita e tipada.
- O modo de impressão de recibo pode ser configurado por ambiente para simulação ou integração com hardware.
