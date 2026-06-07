# front-painel

Interface web do Painel do Lojista em Next.js com App Router.

Este app cuida da navegação, da experiência de operação e da camada de sessão no browser.

## Requisitos

- Node.js 20+
- npm
- Backend disponível para atender as requisições

## Configuração de Ambiente

Arquivo de exemplo:

- [`.env.example`](./.env.example)

Variáveis principais:

- `BACKEND_URL`
- `NEXT_PUBLIC_API_URL`

`BACKEND_URL` é a preferência para chamadas server-side. `NEXT_PUBLIC_API_URL` funciona como fallback quando o backend precisa ser acessado pelo browser.

## Instalação

```bash
npm install
cp .env.example .env
```

## Scripts

- `npm run dev` - inicia o app em desenvolvimento.
- `npm run build` - gera a build de produção.
- `npm run start` - executa a build gerada.
- `npm run lint` - executa ESLint.
- `npm run format` - formata o código.
- `npm run format:check` - valida a formatação.

## Desenvolvimento Local

1. Suba o backend.
2. Configure `BACKEND_URL` para `http://localhost:3001`.
3. Inicie o frontend com `npm run dev`.

O app usa o backend como origem de dados e mantém a sessão por meio da camada intermediária do lado servidor.

## Build

```bash
npm run build
npm run start
```

## Observações

- O projeto segue o App Router.
- A proteção de sessão e de rotas depende da integração com o backend.
- A base atual prioriza build, lint e arquitetura; ainda não há suíte de testes dedicada no frontend.
