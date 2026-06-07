# Painel do Lojista

Sistema full-stack para gestão de loja com foco em operação de caixa, catálogo, usuários, estoque e vendas.

O repositório é dividido em dois aplicativos:

- `back-painel`: API em Node.js com Express, Prisma e MySQL.
- `front-painel`: interface em Next.js com App Router, React Hook Form, Zod, Tailwind e shadcn/ui.

## Visão Geral

O projeto cobre o fluxo central de um MVP de varejo:

- autenticação com login e refresh token
- administração de usuários
- cadastro e manutenção de produtos
- controle de estoque com entradas e saídas
- abertura de caixa
- tela de vendas com carrinho por EAN
- finalização de venda com resumo e recibo

## Estrutura

```text
.
├── back-painel/        # API, Prisma, regras de negócio e testes
├── front-painel/       # App web em Next.js
├── docker-compose.yml  # MySQL, Adminer, backend e frontend
├── Makefile            # Atalhos de desenvolvimento e verificação
├── DESAFIO.md          # Requisitos funcionais do projeto
├── ENVIRONMENT.md      # Mapa central das variáveis de ambiente
├── back-painel/README.md
└── front-painel/README.md
```

## Documentação Base

- [DESAFIO.md](./DESAFIO.md) descreve os requisitos do desafio.
- [ENVIRONMENT.md](./ENVIRONMENT.md) centraliza as variáveis de ambiente.
- [back-painel/README.md](./back-painel/README.md) explica o backend.
- [front-painel/README.md](./front-painel/README.md) explica o frontend.

## Como Rodar

O projeto foi pensado para rodar principalmente com Docker.
O caminho oficial é:

```bash
make run-dev
```

Ou diretamente:

```bash
docker compose up --build
```

Serviços expostos por padrão:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Adminer: `http://localhost:8080`

## Requisitos

- Docker e Docker Compose para subir a stack completa.
- `make` para usar os atalhos do repositório.
- Node.js 20+ somente se você quiser executar algum app manualmente fora do Docker.
- npm somente para manutenção local dos apps fora do fluxo principal.

## Configuração

Existem arquivos de exemplo para as três camadas do projeto:

- [`.env.example`](./.env.example)
- [`back-painel/.env.example`](./back-painel/.env.example)
- [`front-painel/.env.example`](./front-painel/.env.example)

Fluxo recomendado:

1. Copie os arquivos de exemplo para os respectivos `.env`.
2. Ajuste `DATABASE_URL`, `SHADOW_DATABASE_URL`, `JWT_SECRET` e `REFRESH_TOKEN_SECRET`.
3. Configure `BACKEND_URL` no frontend para o endereço da API.
4. Use `make run-dev` para subir a stack completa.

### Execução manual

A execução sem Docker existe, mas não é o fluxo principal do projeto.
Use apenas se você estiver ajustando o backend ou o frontend isoladamente.

## Comandos Principais

### Makefile

- `make run-dev` - sobe a stack com Docker Compose.
- `make down-dev` - derruba os containers.
- `make format` - formata backend e frontend.
- `make format-check` - valida formatação.
- `make lint` - executa lint nos dois apps.
- `make build` - executa build nos dois apps.
- `make test` - executa a suíte do backend via Docker Compose.
- `make setup-hooks` - configura hooks locais do Git.

### Backend

- `npm run dev` - modo de desenvolvimento.
- `npm run build` - build TypeScript; o Prisma client é gerado antes do build.
- `npm run lint` - lint do projeto.
- `npm run test:run` - executa os testes de integração e serviço.
- `npm run prisma:generate` - gera o Prisma client.
- `npm run prisma:migrate:deploy` - aplica migrations no banco configurado.
- `npm run prisma:seed` - popula o banco com dados iniciais.

### Frontend

- `npm run dev` - modo de desenvolvimento.
- `npm run build` - build de produção.
- `npm run start` - executa o build gerado.
- `npm run lint` - lint do projeto.

## Fluxo de Desenvolvimento

1. Suba o banco com Docker Compose.
2. Configure as variáveis de ambiente.
3. Rode migrations e seed do backend quando necessário.
4. Inicie o backend e o frontend com `make run-dev`.
5. Acesse o painel e faça login com os dados do seed.

## Observações

- O backend concentra a regra de negócio e expõe a API.
- O frontend usa uma camada intermediária para conversar com a API e manter sessão/cookies.
- A documentação de ambiente é centralizada em [ENVIRONMENT.md](./ENVIRONMENT.md).
