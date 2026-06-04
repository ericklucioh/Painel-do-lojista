# Backend Review - Painel do Lojista

## Veredito

O backend esta bem estruturado para um MVCS: TypeScript strict, Zod nas bordas, Prisma, rotas separadas por dominio e testes de integracao presentes. O problema nao e arquitetura basal; e o fato de alguns contratos centrais ainda estarem desalinhados com o `DESAFIO.md` e com os fluxos que o frontend precisa consumir.

## Achados

### 1. `login`/`refresh` nao usam `httpOnly cookie`, entao o backend nao atende o fluxo de sessao pedido

O desafio pede JWT em cookie `httpOnly` e renovacao automatica. Aqui, o backend so valida e retorna tokens em JSON; ele nao seta cookie, nao renova cookie e nao limpa cookie no logout. Isso deixa a responsabilidade da sessao muito mais exposta ao cliente do que o requisito pede.

Referencias:

- [src/modules/auth/auth.controller.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/auth/auth.controller.ts#L35)
- [src/modules/auth/auth.controller.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/auth/auth.controller.ts#L47)
- [src/modules/auth/auth.controller.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/auth/auth.controller.ts#L78)
- [src/modules/auth/auth.service.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/auth/auth.service.ts#L60)

Impacto:

- Nao cumpre o contrato descrito no desafio.
- Enfraquece a proposta de seguranca do login.
- Faz o frontend depender de tokens em body em vez de cookie server-side.

### 2. Criacao de usuario exige `cpf`, mas o desafio e a UI nao modelam esse dado

O backend tornou `cpf` obrigatorio na criacao de usuario, com validacao, checagem de unicidade e persistencia. O `DESAFIO.md` nao cita CPF para o CRUD de usuarios, e o frontend atual tambem nao coleta esse campo. Do jeito que esta, o contrato backend/frontend fica quebrado para essa operacao.

Referencias:

- [src/modules/users/users.schema.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/users/users.schema.ts#L12)
- [src/modules/users/users.service.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/users/users.service.ts#L127)
- [prisma/schema.prisma](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/prisma/schema.prisma#L14)

Impacto:

- O fluxo de cadastro fica inconsistente com o escopo do desafio.
- A API exige um campo que a interface nao oferece.
- A regra de negocio ganha um dado sensivel sem justificativa no requisito.

### 3. Numero de recibo e gerado manualmente por leitura do ultimo registro, o que abre corrida e quebra a unicidade sob concorrencia

O schema declara `receiptNumber` como `@unique` e `@default(autoincrement())`, mas a service ignora o default e calcula `lastSale + 1` dentro da transacao. Em carga concorrente, duas vendas podem ler o mesmo ultimo numero antes do insert, produzindo conflito de unicidade ou sequencia inconsistente.

Referencias:

- [src/modules/sales/sales.service.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/sales/sales.service.ts#L187)
- [prisma/schema.prisma](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/prisma/schema.prisma#L145)

Impacto:

- Risco de falha em vendas simultaneas.
- O requisito de recibo sequencial fica vulneravel.
- A transacao nao protege o numero contra corrida entre requisicoes.

### 4. Abertura de caixa faz check-then-insert sem protecao transacional, entao a regra de "um caixa aberto por usuario" pode ser burlada sob concorrencia

A service verifica se ja existe caixa aberto e, em seguida, cria o novo registro. Sem lock ou transacao envolvendo a leitura e a escrita, duas requisicoes paralelas podem passar pelo check antes do insert. O schema ajuda com `activeOpenedByUserId @unique`, mas a logica de negocio continua suscetivel a erro de corrida e vai estourar em runtime.

Referencias:

- [src/modules/cash-registers/cash-registers.service.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/modules/cash-registers/cash-registers.service.ts#L59)
- [prisma/schema.prisma](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/prisma/schema.prisma#L82)

Impacto:

- Pode permitir dois caixas abertos para o mesmo usuario em concorrencia.
- A integridade do fluxo de PDV fica fragilizada.
- O erro deve aparecer como falha de banco, nao como regra de negocio clara.

### 5. CORS esta permissivo demais para um backend com credenciais

O backend libera `origin: true` com `credentials: true`, o que aceita requests credentialed de qualquer origem. Em desenvolvimento isso e toleravel; em producao, vira uma superficie desnecessariamente ampla para um sistema que lida com autenticao e caixa.

Referencias:

- [src/app.ts](/home/erick/code/projs/PAINEL-DO-LOJISTA-/back-painel/src/app.ts#L51)

Impacto:

- Aumenta o risco de abuso cross-origin.
- Enfraquece a postura de seguranca da camada de transporte.
- Merece whitelist de origem antes de deploy real.

## O que esta bom

- Separacao por dominios esta clara.
- Validacao com Zod esta aplicada nas bordas.
- `strict` no TypeScript esta mantido.
- Os testes de integracao existem e cobrem os endpoints principais.
- O uso de transacao na venda e um ponto positivo importante.

## Conclusao

O backend ja tem a espinha dorsal certa, mas ainda nao esta completamente alinhado ao contrato do desafio. Os pontos mais urgentes sao:

- mover o fluxo de auth para cookie `httpOnly`;
- alinhar o CRUD de usuario com o que a UI e o desafio realmente pedem;
- eliminar a geracao manual do `receiptNumber`;
- blindar a regra de caixa aberto contra concorrencia;
- restringir CORS antes de considerar esse backend pronto para deploy.
