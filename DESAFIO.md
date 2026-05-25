# SPRINT: PAINEL DO LOJISTA V1
## MVCS (Minimum Viable Core System)

**Data:** 24 de Maio de 2026  
**Objetivo:** Validar capacidades técnicas em full-stack com foco em CRUD, autenticação, validação e integração frontend-backend.

---

## 1. HISTÓRIAS DE USUÁRIO DETALHADAS

### HU 1.1: Autenticação com JWT
**Status:** Backend + Frontend  
**Estimativa:** 4h

- Como um usuário (Admin/Vendedor), quero fazer login com e-mail e senha para acessar o sistema com segurança.

**Critérios de Aceitação (BDD):**
- Login com e-mail válido e senha correta → JWT armazenado em httpOnly cookie + redirecionamento home
- JWT expira em 15 minutos; Refresh Token renova automaticamente
- Login com credenciais inválidas → erro 401 com mensagem clara
- Token inválido em requisição → 401 Unauthorized

**Backend (Node.js/Express/Prisma):**
- Endpoint: POST /api/auth/login com validação de e-mail + password
- Hash password com bcryptjs (já armazenado no banco)
- Gerar JWT (15min exp) + Refresh Token (7 dias)
- Retornar tokens + user info { id, nome, tipo }
- Endpoint: POST /api/auth/refresh para renovar JWT
- Middleware de autenticação: verifyToken (JWT validation)

**Frontend (Next.js + React Hook Form + Zod):**
- Página: app/(auth)/login/page.tsx
- Componente: LoginForm com validação Zod
- Interceptor Axios: renovar JWT automaticamente
- Armazenar tokens em httpOnly cookie (server-side)
- Redirecionar para home após login

**Testes:**
- POST /api/auth/login com credenciais válidas → token
- POST /api/auth/login com credenciais inválidas → 401
- POST /api/auth/refresh com refresh token válido → novo JWT
- Requisição sem token → 401

---

### HU 1.2: CRUD de Usuários (Admin Only)
**Status:** Backend + Frontend  
**Estimativa:** 4h

- Como administrador, quero criar, listar, editar e desativar usuários para controlar acessos do sistema.

**Critérios de Aceitação (BDD):**
- Admin acessa /admin/usuarios e vê tabela com usuários: Nome | E-mail | Tipo | Status
- Criar usuário com Email, Senha, Nome, Tipo → sucesso com toast
- E-mail duplicado → erro 400 "Este e-mail já está registrado"
- Editar nome ou tipo de usuário → alterações persistem
- Desativar usuário → soft delete (ativo = false), não aparece em listagem
- Vendedor tenta acessar /admin/usuarios → redirecionado, mensagem "Acesso negado"

**Backend (Node.js/Express/Prisma):**
- Middleware: requireRole("admin") em todas as rotas
- GET /api/users?page=1 → listar usuários paginados
- POST /api/users → criar usuário (validar email único, hash password)
- PUT /api/users/:id → editar usuário
- PATCH /api/users/:id/deactivate → desativar (soft delete)

**Frontend (Next.js):**
- Página: app/admin/usuarios/page.tsx
- Componente: UserTable com listagem paginada
- Modal: UserFormModal para criar/editar
- Validação Zod: userCreateSchema, userEditSchema
- Proteger rota com middleware Next.js (checkRole)
- Toasts de sucesso/erro

---

### HU 2.1: CRUD de Produtos
**Status:** Backend + Frontend  
**Estimativa:** 8h

- Como administrador, quero criar, listar, editar e inativar produtos para manter o catálogo atualizado.

**Critérios de Aceitação (BDD):**
- Admin acessa /admin/produtos e vê tabela: EAN | Nome | Preço | Estoque | Ações
- Produtos com estoque ≤ estoque_mínimo são destacados em vermelho
- Criar produto com EAN válido (13 dígitos), Nome, Preço, Estoque Mín/Máx → sucesso
- EAN duplicado → erro "Este EAN já existe"
- Preço ≤ 0 → erro "Preço deve ser maior que zero"
- estoque_mín ≥ estoque_máx → erro de validação
- Editar produto → alterações persistem
- Inativar produto → soft delete (ativo = false)

**Backend (Node.js/Express/Prisma):**
- GET /api/products?page=1&search=termo → lista com flag is_critical
- POST /api/products → criar com validações (EAN unique, preço > 0)
- PUT /api/products/:id → editar
- PATCH /api/products/:id/deactivate → inativar

**Frontend (Next.js):**
- Página: app/admin/produtos/page.tsx
- Componente: ProductTable com listagem, paginação, busca
- Modal: ProductFormModal para criar/editar
- Validação Zod: productSchema (EAN 13 dígitos, preço > 0, estoque_min < máx)
- Destaque visual para produtos críticos

---

### HU 2.2: Busca de Produto por EAN (para PDV)
**Status:** Backend + Frontend  
**Estimativa:** 2h

- Como vendedor, quero buscar um produto por código de barras (EAN) para adicioná-lo rapidamente ao carrinho.

**Critérios de Aceitação (BDD):**
- Escanear/digitar EAN válido → sistema retorna Produto | Preço | Estoque Atual
- EAN inexistente → mensagem "Produto não encontrado"
- Produto inativo → mensagem "Produto não disponível para venda"

**Backend (Node.js/Express):**
- GET /api/products/by-ean/:ean → produto ativo com { id, nome, preco, estoque_atual }
- Produto não encontrado → 404

---

### HU 3.1: Registro de Entrada/Saída de Estoque
**Status:** Backend + Frontend  
**Estimativa:** 6h

- Como administrador, quero registrar entradas (compra, devolução) e saídas (danificado, perda) de estoque para manter o controle atualizado.

**Critérios de Aceitação (BDD):**
- Admin acessa /admin/estoque e clica "Registrar Entrada"
- Preenche: Produto, Tipo (Compra/Devolução/Outros), Quantidade, Observação
- Movimento é registrado e estoque é atualizado → toast "Entrada registrada com sucesso"
- Registrar saída (Danificado/Perda) → movimento criado, estoque diminui (permite negativo)
- Visualizar histórico de movimentos de um produto com tabela: Data | Tipo | Quantidade | Saldo

**Backend (Node.js/Express/Prisma):**
- POST /api/stock/entry → criar ProductMovement entrada
- POST /api/stock/exit → criar ProductMovement saída
- GET /api/stock/history?produto_id=X → histórico com saldo cumulativo

---

### HU 4.1: Tela de Vendas (PDV) - Carrinho
**Status:** Backend + Frontend  
**Estimativa:** 6h

- Como vendedor, quero adicionar produtos ao carrinho escaneando código de barras, alterar quantidades e aplicar descontos antes de finalizar a venda.

**Critérios de Aceitação (BDD):**
- Escanear código → produto adicionado ao carrinho com qty=1: Produto | Qtd | Preço Unit | Subtotal
- Escanear mesmo código novamente → qty incrementa para 2 (não duplica)
- Alterar qtd e pressionar Enter → carrinho recalcula subtotal
- Clicar "X" em item → item removido
- Aplicar desconto de R$ 50 → novo total = valor_bruto - desconto
- Clicar "Finalizar Venda" sem caixa aberto → erro "Abra um caixa antes de vender"
- Caixa aberto + clique em "Finalizar Venda" → Modal com resumo (Total Itens | Valor Bruto | Desconto | TOTAL) e forma de pagamento

**Backend (Node.js/Express):**
- POST /api/cash-registers/open → { saldo_inicial, observacao? }
- Validar: apenas 1 caixa aberto por user_id
- GET /api/products/by-ean/:ean (reutilizado)

**Frontend (Next.js + React Hook Form):**
- Página: app/vendas/page.tsx
- Componente: CashRegisterStatus (mostra caixa aberto/fechado)
- Botão: "Abrir Caixa" com modal para saldo inicial
- Campo: Busca por EAN (input + autocomplete)
- Componente: CartTable com items, qty editable, remove button
- Seção: Desconto (input + cálculo automático)
- Resumo: Total Bruto, Desconto, Total Final
- State: React Context ou Zustand para carrinho

---

### HU 4.2: Finalizar Venda (à Vista)
**Status:** Backend + Frontend  
**Estimativa:** 4h

- Como vendedor, quero confirmar uma venda à vista, gerar recibo numerado e imprimir termicamente para entregar ao cliente.

**Critérios de Aceitação (BDD):**
- Confirmar venda à vista com forma_pagamento="Dinheiro" → venda criada com numero_recibo sequencial (001, 002...)
- Recibo exibe: Data | Vendedor | Itens (Produto × Qtd | Preço) | Subtotal | Desconto | TOTAL | Forma Pagamento
- POST /api/print-receipt → tenta imprimir via impressora térmica
- Impressora ok → toast "Recibo impresso com sucesso", carrinho limpo
- Impressora falha → Modal: "Erro ao imprimir. Tentar novamente? | Cancelar Venda"
- Cancelar Venda → DELETE /api/sales/:id (desfaz tudo: estoque volta, entrada caixa removida)

**Backend (Node.js/Express/Prisma):**
- POST /api/sales → Transação ACID: criar sales + sale_items + product_movements + cash_movements
- numero_recibo: sequencial (auto-increment)
- Validações: caixa_register_id aberto, produtos existem e ativos
- POST /api/print-receipt → comunicação com impressora
- DELETE /api/sales/:id → cancelar venda (rollback tudo)

**Frontend (Next.js):**
- Modal: "Resumo da Venda" com forma pagamento
- Ao confirmar: POST /api/sales
- Gerar preview do recibo
- POST /api/print-receipt
- Se erro impressão: Modal com "Retry" ou "Cancelar"
- Se cancelar: DELETE /api/sales/:id

---

### HU 5.1: Setup Infrastructure
**Status:** DevOps/Config  
**Estimativa:** 2h

- Preparar ambiente de desenvolvimento e deploy para validação do projeto.

**Checklist:**
- Git repository (GitHub/GitLab) inicializado
- Docker Compose com MySQL 8.0 + Adminer
- .env.example com variáveis necessárias
- Prisma migrations: npx prisma migrate dev --name init
- Seed script: scripts/seed.ts com usuários de teste (admin, vendedor)
- Build scripts funcionando (npm run build)
- Dev scripts: npm run dev em backend e frontend
- README.md com instruções de setup

---

## 2. REQUISITOS TÉCNICOS OBRIGATÓRIOS

### Backend (Node.js/Express/Prisma)
- TypeScript: strict mode habilitado
- Prisma ORM: schema.prisma com todos os modelos
- Middleware de autenticação: JWT com refresh token
- Middleware de autorização: roles (admin, vendedor)
- Validação: Zod em endpoints críticos
- Tratamento de erros: global error handler
- Transações ACID: venda (sale + items + movements + estoque)
- ESLint + Prettier: no padrão do projeto

### Frontend (Next.js/React/Tailwind)
- App Router: estrutura moderna
- shadcn/ui: componentes (Button, Input, Dialog, Table, etc)
- Tailwind CSS: sem CSS inline
- React Hook Form: gerenciar formulários
- Zod: validação de schemas
- Axios: chamadas à API com interceptor para JWT
- Middleware Next.js: proteger rotas por role
- Toast/Notificações: sonner ou shadcn/toast
- Prettier + ESLint: padrão do projeto

### Banco de Dados (MySQL via Docker)
- Docker Compose: definir MySQL 8.0
- Prisma migrations: versionar schema
- Seed script: popular dados de teste
- Índices: EAN, email, CPF (já no schema)

---

## 3. OBSERVAÇÕES IMPORTANTES

⚠️ **Para o Candidato:**
- A qualidade do código é tão importante quanto a funcionalidade
- Siga o padrão do projeto (ESLint, Prettier, estrutura de pastas)
- Commit regularmente com mensagens claras
- Teste localmente antes de fazer push
- Documente decisões técnicas em comentários se não-óbvias
- Se travar em algo, peça ajuda (clareza é melhor que silêncio)

⚠️ **Para a Avaliação:**
- Código será revisado com foco em boas práticas
- Performance não é prioridade nesta sprint (MVP)
- Segurança é crítica (JWT, validações, ACID)
- Cobertura de testes não é obrigatória, mas é um diferencial

---

## RESUMO EXECUTIVO

| Item | Descrição |
|------|-----------|
| **Objetivo** | Implementar MVP de PDV: Login, CRUD Produtos, Estoque, PDV à Vista |
| **Stack** | Next.js + Node.js/Express/Prisma + MySQL |
| **Perfil** | Full-Stack Junior/Pleno |
| **Entrega** | GitHub repo + documentação + funcionando localmente |
| **Avaliação** | Funcionalidade, Código, Arquitetura, Segurança, Testes |

---

**Boa sorte! 🚀**