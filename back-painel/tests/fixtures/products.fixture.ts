import { Prisma } from "@prisma/client";
import type {
    TestInventoryMovementRecord,
    TestProductRecord,
} from "./test-records";

const now = new Date("2026-05-24T10:00:00.000Z");

export const productsFixture: TestProductRecord[] = [
    {
        id: "prod_001",
        ean: "7891000100015",
        name: "Refrigerante Cola 2L",
        salePrice: new Prisma.Decimal("12.90"),
        minStock: 10,
        maxStock: 80,
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
    {
        id: "prod_002",
        ean: "7891000100022",
        name: "Arroz 5kg",
        salePrice: new Prisma.Decimal("29.90"),
        minStock: 12,
        maxStock: 100,
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
    {
        id: "prod_003",
        ean: "7891000100039",
        name: "Feijao Carioca 1kg",
        salePrice: new Prisma.Decimal("8.50"),
        minStock: 8,
        maxStock: 60,
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
    {
        id: "prod_004",
        ean: "7891000100046",
        name: "Leite Integral 1L",
        salePrice: new Prisma.Decimal("5.99"),
        minStock: 6,
        maxStock: 40,
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
];

export const inventoryMovementsFixture: TestInventoryMovementRecord[] = [
    {
        productId: "prod_001",
        type: "COMPRA",
        quantity: 20,
    },
    {
        productId: "prod_001",
        type: "VENDA",
        quantity: 2,
    },
    {
        productId: "prod_002",
        type: "COMPRA",
        quantity: 10,
    },
    {
        productId: "prod_002",
        type: "PERDA",
        quantity: 3,
    },
    {
        productId: "prod_003",
        type: "COMPRA",
        quantity: 30,
    },
    {
        productId: "prod_003",
        type: "VENDA",
        quantity: 6,
    },
    {
        productId: "prod_004",
        type: "COMPRA",
        quantity: 12,
    },
    {
        productId: "prod_004",
        type: "AJUSTE_SAIDA",
        quantity: 8,
    },
];
