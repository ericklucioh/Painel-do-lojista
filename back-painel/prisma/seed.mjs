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
const hiddenAt = new Date("2026-05-25T08:00:00.000Z");
const deletedAt = new Date("2026-05-29T18:00:00.000Z");
const closedAt = new Date("2026-05-26T19:30:00.000Z");
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
    {
        id: "user_admin_2",
        fullName: "Carla Administradora",
        cpf: "33333333333",
        email: "carla@painel.com",
        passwordHash,
        role: "ADMIN",
        deactivatedAt: hiddenAt,
        createdAt: now,
        updatedAt: hiddenAt,
        deletedAt: null,
    },
    {
        id: "user_vendor_2",
        fullName: "Bruno Vendedor",
        cpf: "44444444444",
        email: "bruno@painel.com",
        passwordHash,
        role: "VENDEDOR",
        deactivatedAt: hiddenAt,
        createdAt: now,
        updatedAt: hiddenAt,
        deletedAt: deletedAt,
    },
    {
        id: "user_vendor_3",
        fullName: "Livia Operadora",
        cpf: "55555555555",
        email: "livia@painel.com",
        passwordHash,
        role: "VENDEDOR",
        deactivatedAt: null,
        createdAt: now,
        updatedAt: hiddenAt,
        deletedAt: deletedAt,
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
    {
        id: "prod_005",
        ean: "7891000100053",
        name: "Biscoito Recheado 120g",
        salePrice: decimal("4.49"),
        minStock: 15,
        maxStock: 120,
        deactivatedAt: hiddenAt,
        deletedAt: null,
        createdAt: now,
        updatedAt: hiddenAt,
    },
    {
        id: "prod_006",
        ean: "7891000100060",
        name: "Cafe Torrado 500g",
        salePrice: decimal("18.9"),
        minStock: 8,
        maxStock: 50,
        deactivatedAt: hiddenAt,
        deletedAt: deletedAt,
        createdAt: now,
        updatedAt: hiddenAt,
    },
    {
        id: "prod_007",
        ean: "7891000100077",
        name: "Sabonete Neutro",
        salePrice: decimal("2.75"),
        minStock: 20,
        maxStock: 200,
        deactivatedAt: null,
        deletedAt: deletedAt,
        createdAt: now,
        updatedAt: hiddenAt,
    },
    {
        id: "prod_008",
        ean: "7891000100084",
        name: "Detergente 500ml",
        salePrice: decimal("3.35"),
        minStock: 12,
        maxStock: 80,
        deactivatedAt: hiddenAt,
        deletedAt: null,
        createdAt: now,
        updatedAt: hiddenAt,
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
    {
        id: "mov_009",
        productId: "prod_005",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 48,
        note: "Lote para vitrine desativada",
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_010",
        productId: "prod_005",
        userId: "user_admin_1",
        type: "VENDA",
        quantity: 5,
        note: null,
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_011",
        productId: "prod_006",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 20,
        note: "Produto arquivado",
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_012",
        productId: "prod_006",
        userId: "user_admin_1",
        type: "DANIFICADO",
        quantity: 2,
        note: "Lata amassada",
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_013",
        productId: "prod_007",
        userId: "user_admin_1",
        type: "AJUSTE_ENTRADA",
        quantity: 15,
        note: "Ajuste manual",
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_014",
        productId: "prod_007",
        userId: "user_admin_1",
        type: "PERDA",
        quantity: 4,
        note: "Quebra no transporte",
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_015",
        productId: "prod_008",
        userId: "user_admin_1",
        type: "COMPRA",
        quantity: 60,
        note: null,
        saleId: null,
        createdAt: hiddenAt,
    },
    {
        id: "mov_016",
        productId: "prod_008",
        userId: "user_admin_1",
        type: "AJUSTE_SAIDA",
        quantity: 10,
        note: "Inventário",
        saleId: null,
        createdAt: hiddenAt,
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

const closedCashRegister = {
    id: "cash_register_2",
    openedByUserId: "user_vendor_1",
    activeOpenedByUserId: null,
    initialBalance: decimal("350.00"),
    status: "FECHADO",
    openedAt: hiddenAt,
    closedAt: closedAt,
    createdAt: hiddenAt,
    updatedAt: closedAt,
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
    {
        id: "cash_move_3",
        cashRegisterId: "cash_register_2",
        saleId: null,
        type: "ABERTURA",
        amount: decimal("350.00"),
        note: "Caixa de demonstração fechado",
        createdByUserId: "user_vendor_1",
        createdAt: hiddenAt,
    },
    {
        id: "cash_move_4",
        cashRegisterId: "cash_register_2",
        saleId: null,
        type: "ENTRADA",
        amount: decimal("80.00"),
        note: "Ajuste manual",
        createdByUserId: "user_admin_1",
        createdAt: hiddenAt,
    },
    {
        id: "cash_move_5",
        cashRegisterId: "cash_register_2",
        saleId: null,
        type: "SAIDA",
        amount: decimal("18.50"),
        note: "Troco e baixa operacional",
        createdByUserId: "user_admin_1",
        createdAt: closedAt,
    },
    {
        id: "cash_move_6",
        cashRegisterId: "cash_register_2",
        saleId: null,
        type: "CANCELAMENTO",
        amount: decimal("29.90"),
        note: "Venda cancelada em demonstração",
        createdByUserId: "user_vendor_1",
        createdAt: closedAt,
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
    await prisma.cashRegister.create({ data: closedCashRegister });
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
