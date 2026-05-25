# TODAS AS ROTAS REQUISITADAS NO DOCUMENTO

## AUTENTICAÇÃO (2 rotas)

| Método | Endpoint | Descrição | HU |
|--------|----------|-----------|-----|
| POST | `/api/auth/login` | Login com e-mail e senha, retorna JWT + Refresh Token + user info | 1.1 |
| POST | `/api/auth/refresh` | Renovar JWT usando Refresh Token | 1.1 |

## USUÁRIOS (4 rotas)

| Método | Endpoint | Descrição | HU |
|--------|----------|-----------|-----|
| GET | `/api/users?page=1` | Listar usuários paginados | 1.2 |
| POST | `/api/users` | Criar usuário (email único, hash password) | 1.2 |
| PUT | `/api/users/:id` | Editar usuário (nome ou tipo) | 1.2 |
| PATCH | `/api/users/:id/deactivate` | Desativar usuário (soft delete) | 1.2 |

## PRODUTOS (5 rotas)

| Método | Endpoint | Descrição | HU |
|--------|----------|-----------|-----|
| GET | `/api/products?page=1&search=termo` | Listar produtos com flag is_critical | 2.1 |
| GET | `/api/products/by-ean/:ean` | Buscar produto ativo por EAN (retorna id, nome, preco, estoque_atual) | 2.2 |
| POST | `/api/products` | Criar produto (EAN 13 dígitos, preço > 0, estoque_min < max) | 2.1 |
| PUT | `/api/products/:id` | Editar produto | 2.1 |
| PATCH | `/api/products/:id/deactivate` | Inativar produto (soft delete) | 2.1 |

## ESTOQUE (3 rotas)

| Método | Endpoint | Descrição | HU |
|--------|----------|-----------|-----|
| POST | `/api/stock/entry` | Registrar entrada (Compra/Devolução/Outros) | 3.1 |
| POST | `/api/stock/exit` | Registrar saída (Danificado/Perda) | 3.1 |
| GET | `/api/stock/history?produto_id=X` | Histórico de movimentos com saldo cumulativo | 3.1 |

## CAIXA E VENDAS (4 rotas)

| Método | Endpoint | Descrição | HU |
|--------|----------|-----------|-----|
| POST | `/api/cash-registers/open` | Abrir caixa (saldo_inicial, observacao?) - apenas 1 por user_id | 4.1 |
| POST | `/api/sales` | Finalizar venda (transação ACID: sale + items + movements + cash_movements) | 4.2 |
| DELETE | `/api/sales/:id` | Cancelar venda (rollback: estoque volta, entrada caixa removida) | 4.2 |
| POST | `/api/print-receipt` | Imprimir recibo via impressora térmica | 4.2 |

---

## RESUMO TOTAL

| Categoria | Quantidade de Rotas |
|-----------|---------------------|
| Autenticação | 2 |
| Usuários | 4 |
| Produtos | 5 |
| Estoque | 3 |
| Caixa e Vendas | 4 |
| **TOTAL** | **18 rotas** |

---

## OBSERVAÇÕES IMPORTANTES

### Middlewares obrigatórios:
- `verifyToken` → protege todas as rotas exceto `/api/auth/login` e `/api/auth/refresh`
- `requireRole("admin")` → protege rotas: users, products (POST/PUT/PATCH), stock (entry/exit/history)
- `requireRole("vendedor")` → protege rotas: products/by-ean, cash-registers/open, sales, print-receipt

### Validações específicas por rota:

| Rota | Validação |
|------|-----------|
| `POST /api/users` | Email único, hash password com bcryptjs |
| `POST /api/products` | EAN único (13 dígitos), preço > 0, estoque_min < estoque_max |
| `GET /api/products/by-ean/:ean` | Retorna 404 se não encontrado, erro se produto inativo |
| `POST /api/cash-registers/open` | Apenas 1 caixa aberto por user_id |
| `POST /api/sales` | caixa_register_id aberto, produtos existem e ativos, numero_recibo sequencial |