import { config as loadEnv } from "dotenv";
import { hashSync } from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Prisma } from "@prisma/client";

loadEnv({ override: process.env.DOCKER_DEV !== "true" });

function parseMysqlUrl(databaseUrl) {
    const url = new URL(databaseUrl);

    if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
        throw new Error(
            "DATABASE_URL must use the mysql:// or mariadb:// protocol",
        );
    }

    return {
        host: url.hostname,
        port: url.port ? Number(url.port) : undefined,
        user: url.username || undefined,
        password: url.password || undefined,
        database: url.pathname.replace(/^\/+/, "") || undefined,
        allowPublicKeyRetrieval: true,
        connectTimeout: 10000,
    };
}

const now = new Date("2026-05-24T10:00:00.000Z");
const passwordHash = hashSync("123456", 10);
const decimal = (value) => new Prisma.Decimal(value);

const users = [
    {
        id: "user_admin_1",
        fullName: "Admin do Sistema",
        cpf: "11111111111",
        email: "admin@painel.com",
        passwordHash,
        role: "ADMIN",
        deactivatedAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
    },
    {
        id: "user_vendor_1",
        fullName: "Joao Vendedor",
        cpf: "22222222222",
        email: "joao@painel.com",
        passwordHash,
        role: "VENDEDOR",
        deactivatedAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
    },
];

const products = [
    {
        id: "prod_001",
        ean: "7891000100015",
        name: "Refrigerante Cola 2L",
        salePrice: decimal("12.90"),
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
        salePrice: decimal("29.90"),
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
        salePrice: decimal("8.50"),
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
        salePrice: decimal("5.99"),
        minStock: 6,
        maxStock: 40,
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
];

const inventoryMovements = [
    {
        id: "mov_001",
        productId: "prod_001",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 20,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_002",
        productId: "prod_001",
        userId: "user_admin_1",
        type: "VENDA",
        quantity: 2,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_003",
        productId: "prod_002",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 10,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_004",
        productId: "prod_002",
        userId: "user_admin_1",
        type: "PERDA",
        quantity: 3,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_005",
        productId: "prod_003",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 30,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_006",
        productId: "prod_003",
        userId: "user_admin_1",
        type: "VENDA",
        quantity: 6,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_007",
        productId: "prod_004",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 12,
        note: null,
        saleId: null,
        createdAt: now,
    },
    {
        id: "mov_008",
        productId: "prod_004",
        userId: "user_admin_1",
        type: "AJUSTE_SAIDA",
        quantity: 8,
        note: null,
        saleId: null,
        createdAt: now,
    },
];

const cashRegister = {
    id: "cash_register_1",
    openedByUserId: "user_admin_1",
    activeOpenedByUserId: "user_admin_1",
    initialBalance: decimal("200.00"),
    status: "ABERTO",
    openedAt: now,
    closedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
};

const sale = {
    id: "sale_1",
    receiptNumber: 1,
    cashRegisterId: "cash_register_1",
    soldByUserId: "user_vendor_1",
    subtotal: decimal("42.80"),
    discountAmount: decimal("0.00"),
    totalAmount: decimal("42.80"),
    paymentMethod: "PIX",
    status: "CONFIRMADA",
    cancelledAt: null,
    cancelReason: null,
    createdAt: now,
};

const saleItems = [
    {
        id: "sale_item_1",
        saleId: "sale_1",
        productId: "prod_001",
        productNameSnapshot: "Refrigerante Cola 2L",
        productEanSnapshot: "7891000100015",
        unitPriceSnapshot: decimal("12.90"),
        quantity: 1,
        subtotal: decimal("12.90"),
    },
    {
        id: "sale_item_2",
        saleId: "sale_1",
        productId: "prod_002",
        productNameSnapshot: "Arroz 5kg",
        productEanSnapshot: "7891000100022",
        unitPriceSnapshot: decimal("29.90"),
        quantity: 1,
        subtotal: decimal("29.90"),
    },
];

const cashMovements = [
    {
        id: "cash_move_1",
        cashRegisterId: "cash_register_1",
        saleId: null,
        type: "ABERTURA",
        amount: decimal("200.00"),
        note: "Abertura inicial do caixa",
        createdByUserId: "user_admin_1",
        createdAt: now,
    },
    {
        id: "cash_move_2",
        cashRegisterId: "cash_register_1",
        saleId: "sale_1",
        type: "VENDA",
        amount: decimal("42.80"),
        note: "Venda registrada no caixa",
        createdByUserId: "user_admin_1",
        createdAt: now,
    },
];

async function seedIfEmpty(prisma) {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        return;
    }

    for (const user of users) {
        await prisma.user.create({ data: user });
    }

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    for (const movement of inventoryMovements) {
        await prisma.inventoryMovement.create({ data: movement });
    }

    await prisma.cashRegister.create({ data: cashRegister });
    await prisma.sale.create({ data: sale });

    for (const item of saleItems) {
        await prisma.saleItem.create({ data: item });
    }

    for (const movement of cashMovements) {
        await prisma.cashMovement.create({ data: movement });
    }
}

async function main() {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is required to seed Prisma");
    }

    const prisma = new PrismaClient({
        adapter: new PrismaMariaDb(parseMysqlUrl(databaseUrl)),
    });

    try {
        await seedIfEmpty(prisma);
    } finally {
        await prisma.$disconnect();
    }
}

await main();
