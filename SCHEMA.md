<!-- rascunho inicial -->
model User {
  id           Int      @id @default(autoincrement())
  nome         String
  email        String   @unique
  passwordHash String
  tipo         UserRole
  ativo        Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum UserRole {
  ADMIN
  VENDEDOR
}

model Product {
  id            Int      @id @default(autoincrement())
  ean           String   @unique
  nome          String
  preco         Decimal  @db.Decimal(10, 2)
  estoqueAtual  Int      @default(0)
  estoqueMinimo Int
  estoqueMaximo Int
  ativo         Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ProductMovement {
  id         Int                 @id @default(autoincrement())
  productId  Int
  userId     Int
  tipo       ProductMovementType
  quantidade Int
  observacao String?
  saldo      Int
  createdAt  DateTime            @default(now())

  product Product @relation(fields: [productId], references: [id])
  user    User    @relation(fields: [userId], references: [id])
}

enum ProductMovementType {
  COMPRA
  DEVOLUCAO
  OUTROS
  DANIFICADO
  PERDA
}

model CashRegister {
  id           Int                @id @default(autoincrement())
  userId       Int
  saldoInicial Decimal            @db.Decimal(10, 2)
  observacao   String?
  status       CashRegisterStatus @default(ABERTO)
  openedAt     DateTime           @default(now())
  closedAt     DateTime?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id])
}

enum CashRegisterStatus {
  ABERTO
  FECHADO
}

model Sale {
  id             Int         @id @default(autoincrement())
  numeroRecibo   Int         @unique @default(autoincrement())
  cashRegisterId Int
  userId         Int
  valorBruto     Decimal     @db.Decimal(10, 2)
  desconto       Decimal     @default(0) @db.Decimal(10, 2)
  valorTotal     Decimal     @db.Decimal(10, 2)
  formaPagamento PaymentType
  status         SaleStatus  @default(CONCLUIDA)
  createdAt      DateTime    @default(now())
  cancelledAt    DateTime?

  cashRegister CashRegister @relation(fields: [cashRegisterId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
}

model SaleItem {
  id            Int     @id @default(autoincrement())
  saleId        Int
  productId     Int
  quantidade    Int
  precoUnitario Decimal @db.Decimal(10, 2)
  subtotal      Decimal @db.Decimal(10, 2)

  sale    Sale    @relation(fields: [saleId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

enum PaymentType {
  DINHEIRO
}

enum SaleStatus {
  CONCLUIDA
  CANCELADA
}