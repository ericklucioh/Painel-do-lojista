# Painel do Lojista

Sistema full-stack para gestão de loja com foco em operação de caixa, catálogo, usuários, estoque e vendas.

O projeto foi dividido em dois aplicativos principais:

- `back-painel`: API em Node.js com Express, Prisma, MySQL, autenticação JWT e regras de negócio.
- `front-painel`: interface em Next.js com App Router, React Hook Form, Zod, Tailwind e componentes de UI.

## Visão Geral

Este repositório implementa um painel operacional para o dia a dia da loja. A proposta é cobrir o fluxo básico de um MVP de varejo:

- autenticação com login e refresh token
- administração de usuários
- cadastro e manutenção de produtos
- controle de estoque com entradas e saídas
- abertura de caixa
- tela de vendas com carrinho por EAN
- finalização de venda com resumo e recibo

## Principais Módulos

### Autenticação

- login com e-mail e senha
- JWT de acesso com refresh token
- proteção de rotas no frontend e no backend
- logout com limpeza de sessão

### Usuários

- criação, listagem, edição e desativação
- controle de acesso por papel
- foco em perfis como admin e vendedor

### Produtos

- cadastro com EAN, nome, preço e estoque
- edição e desativação
- busca por EAN para fluxo de PDV

### Estoque

- registro de entrada e saída
- histórico de movimentos
- atualização do saldo do produto

### Vendas

- carrinho por leitura de código de barras
- ajuste de quantidade
- desconto sobre a venda
- abertura de caixa antes da operação
- resumo final antes da confirmação

### Caixa e Recibo

- controle de caixa aberto
- geração de venda com dados consolidados
- fluxo preparado para impressão de recibo

## Stack

- Backend: Node.js, Express, Prisma, MySQL, Zod, JWT
- Frontend: Next.js, React, TypeScript, React Hook Form, Zod, Tailwind, shadcn/ui
- Infra: Docker Compose, Adminer, scripts de ambiente local
- Testes: Vitest e testes de integração no backend

## Estrutura do Repositório

```text
.
├── back-painel/        # API, Prisma, regras de negócio e testes
├── front-painel/       # App web em Next.js
├── docker-compose.yml  # Orquestra banco, API e frontend
├── Makefile            # Atalhos de desenvolvimento
├── DESAFIO.md          # Requisitos funcionais do projeto
├── ROTAS.md            # Contrato das rotas da API
├── SCHEMA.md           # Modelo de dados e regras do banco
└── TASKS.md            # Lista de tarefas e evolução
```

## Requisitos

- Node.js instalado localmente, se for rodar fora do Docker
- Docker e Docker Compose para ambiente completo
- npm para instalar dependências

## Configuração de Ambiente

O projeto já possui arquivos de exemplo de ambiente:

- `/.env.example`
- `/back-painel/.env.example`

Copie os arquivos de exemplo para os respectivos `.env` antes de rodar localmente, quando necessário.

Variáveis importantes:

- banco MySQL
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- URL do backend para o frontend

## Como Rodar

### Ambiente completo com Docker

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

### Rodando localmente sem Docker

Backend:

```bash
cd back-painel
npm install
npm run dev
```

Frontend:

```bash
cd front-painel
npm install
npm run dev
```

## Scripts Úteis

### Raiz

- `make run-dev` - sobe a stack com Docker Compose
- `make down-dev` - derruba os containers
- `make format` - formata backend e frontend
- `make format-check` - valida formatação
- `make setup-hooks` - configura hooks locais do Git
- `make test` - executa os testes do backend

### Backend

- `npm run dev` - modo desenvolvimento
- `npm run build` - build TypeScript
- `npm run test:run` - executa testes
- `npm run prisma:seed` - popula o banco com dados iniciais

### Frontend

- `npm run dev` - modo desenvolvimento
- `npm run build` - build de produção
- `npm run lint` - lint do projeto

## Fluxo de Desenvolvimento

1. Suba o banco com Docker Compose.
2. Configure as variáveis de ambiente.
3. Rode as migrations e o seed do Prisma, quando necessário.
4. Inicie o backend e o frontend.
5. Acesse o painel e faça login com os usuários de teste do seed.

## Observações

- O repositório segue separação clara entre domínio, serviços e transporte.
- As validações usam Zod no backend e no frontend.
- O frontend conversa com a API via camada intermediária, preservando cookies e sessão.
- O projeto foi desenhado para ser evolutivo, mas o foco atual é o MVP operacional.
