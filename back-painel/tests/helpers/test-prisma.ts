import { Prisma, PrismaClient } from "@prisma/client";
import { vi } from "vitest";
import {
    inventoryMovementsFixture,
    productsFixture,
} from "../fixtures/products.fixture";
import { usersFixture } from "../fixtures/users.fixture";
import type {
    TestInventoryMovementRecord,
    TestProductRecord,
    TestUserRecord,
} from "../fixtures/test-records";
import { MemoryStore } from "./memory-store";

let nextId = 1;

function createTestId(prefix: string): string {
    const id = `${prefix}_${String(nextId).padStart(4, "0")}`;
    nextId += 1;
    return id;
}

export interface TestPrismaSeed {
    users: ReadonlyArray<TestUserRecord>;
    products: ReadonlyArray<TestProductRecord>;
    inventoryMovements: ReadonlyArray<TestInventoryMovementRecord>;
}

export type TestUserDelegate = Pick<
    PrismaClient["user"],
    "count" | "findMany" | "findUnique" | "create" | "update"
>;

export type TestProductDelegate = Pick<
    PrismaClient["product"],
    "count" | "findMany" | "findUnique" | "create" | "update"
>;

export type TestInventoryMovementDelegate = Pick<
    PrismaClient["inventoryMovement"],
    "findMany"
>;

export type TestPrismaMock = Pick<
    PrismaClient,
    "user" | "product" | "inventoryMovement"
>;

function normalizeSearch(search: string | undefined): string | undefined {
    const normalized = search?.trim().toLowerCase();
    return normalized === undefined || normalized.length === 0
        ? undefined
        : normalized;
}

function selectFields<T extends Record<string, unknown>>(
    record: T,
    select: Record<string, boolean> | null | undefined,
): Partial<T> | T {
    if (select == null) {
        return record;
    }

    const picked: Partial<T> = {};
    for (const [key, value] of Object.entries(select)) {
        if (value) {
            picked[key as keyof T] = record[key as keyof T];
        }
    }

    return picked;
}

function matchesUserSearch(user: TestUserRecord, search?: string): boolean {
    if (search === undefined) {
        return true;
    }

    return (
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
}

function matchesProductSearch(
    product: TestProductRecord,
    search?: string,
): boolean {
    if (search === undefined) {
        return true;
    }

    return (
        product.name.toLowerCase().includes(search) ||
        product.ean.toLowerCase().includes(search)
    );
}

function createUserRecord(
    input: Omit<TestUserRecord, "id" | "createdAt" | "updatedAt">,
): TestUserRecord {
    const now = new Date();

    return {
        id: createTestId("user"),
        createdAt: now,
        updatedAt: now,
        ...input,
    };
}

function createProductRecord(
    input: Omit<TestProductRecord, "id" | "createdAt" | "updatedAt" | "salePrice"> & {
        salePrice: number | Prisma.Decimal;
    },
): TestProductRecord {
    const now = new Date();

    return {
        id: createTestId("prod"),
        createdAt: now,
        updatedAt: now,
        ...input,
        salePrice:
            input.salePrice instanceof Prisma.Decimal
                ? input.salePrice
                : new Prisma.Decimal(input.salePrice),
    };
}

function cloneDecimalValue(value: number | Prisma.Decimal): Prisma.Decimal {
    return value instanceof Prisma.Decimal
        ? new Prisma.Decimal(value.toString())
        : new Prisma.Decimal(value);
}

function applyOrderByCreatedAt<T extends { createdAt: Date }>(
    items: T[],
    orderBy: unknown,
): T[] {
    const sortDirection = (orderBy as { createdAt?: "asc" | "desc" } | undefined)
        ?.createdAt;

    if (sortDirection === "desc") {
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

function paginate<T>(items: T[], skip?: number, take?: number): T[] {
    const start = skip ?? 0;
    const end = take === undefined ? undefined : start + take;
    return items.slice(start, end);
}

function extractQuerySearch(where: unknown, fieldNames: string[]): string | undefined {
    const maybeWhere = where as {
        OR?: Array<Record<string, { contains?: string }>>;
    } | undefined;

    const searchFromOr = maybeWhere?.OR?.[0];
    if (searchFromOr === undefined) {
        return undefined;
    }

    for (const field of fieldNames) {
        const contains = searchFromOr[field]?.contains;
        if (typeof contains === "string") {
            return normalizeSearch(contains);
        }
    }

    return undefined;
}

function createUserDelegate(store: MemoryStore<TestUserRecord>) {
    const delegate = {
        count: vi.fn(async (args?: Parameters<TestUserDelegate["count"]>[0]) => {
            const where = args?.where;
            const search = extractQuerySearch(where, ["fullName", "email"]);
            return store.list().filter((user) => {
                if (!matchesUserSearch(user, search)) {
                    return false;
                }

                const activeOnly = where as
                    | { deactivatedAt?: Date | null; deletedAt?: Date | null }
                    | undefined;
                return (
                    activeOnly?.deactivatedAt === undefined ||
                    activeOnly.deactivatedAt === user.deactivatedAt
                ) &&
                    (activeOnly?.deletedAt === undefined ||
                        activeOnly.deletedAt === user.deletedAt);
            }).length;
        }),
        findMany: vi.fn(async (args?: Parameters<TestUserDelegate["findMany"]>[0]) => {
            const where = args?.where;
            const search = extractQuerySearch(where, ["fullName", "email"]);
            const filtered = store.list().filter((user) => {
                const normalizedWhere = where as
                    | { deactivatedAt?: Date | null; deletedAt?: Date | null }
                    | undefined;
                const activeMatches =
                    (normalizedWhere?.deactivatedAt === undefined ||
                        normalizedWhere.deactivatedAt === user.deactivatedAt) &&
                    (normalizedWhere?.deletedAt === undefined ||
                        normalizedWhere.deletedAt === user.deletedAt);
                return activeMatches && matchesUserSearch(user, search);
            });

            const ordered = applyOrderByCreatedAt(filtered, args?.orderBy);
            return paginate(ordered, args?.skip, args?.take);
        }),
        findUnique: vi.fn(async (args: Parameters<TestUserDelegate["findUnique"]>[0]) => {
            const where = args.where ?? {};
            const record =
                where.id !== undefined
                    ? store.findById(where.id)
                    : where.email !== undefined
                      ? store.findOne((user) => user.email === where.email)
                      : undefined;

            if (record === undefined) {
                return null;
            }

            return selectFields(record, args.select);
        }),
        create: vi.fn(async (args: Parameters<TestUserDelegate["create"]>[0]) => {
            const created = createUserRecord(args.data);
            return store.insert(created);
        }),
        update: vi.fn(async (args: Parameters<TestUserDelegate["update"]>[0]) => {
            const updated = store.updateById(args.where.id, (current) => ({
                ...current,
                ...args.data,
                updatedAt: new Date(),
            }));

            if (updated === undefined) {
                throw new Error(`User ${args.where.id} not found`);
            }

            return updated;
        }),
    } as unknown as TestUserDelegate;

    return delegate;
}

function createProductDelegate(store: MemoryStore<TestProductRecord>) {
    const delegate = {
        count: vi.fn(async (args?: Parameters<TestProductDelegate["count"]>[0]) => {
            const where = args?.where;
            const search = extractQuerySearch(where, ["name", "ean"]);
            return store.list().filter((product) => {
                const activeOnly = where as
                    | { deactivatedAt?: Date | null; deletedAt?: Date | null }
                    | undefined;

                const activeMatches =
                    (activeOnly?.deactivatedAt === undefined ||
                        activeOnly.deactivatedAt === product.deactivatedAt) &&
                    (activeOnly?.deletedAt === undefined ||
                        activeOnly.deletedAt === product.deletedAt);

                return activeMatches && matchesProductSearch(product, search);
            }).length;
        }),
        findMany: vi.fn(async (args?: Parameters<TestProductDelegate["findMany"]>[0]) => {
            const where = args?.where;
            const search = extractQuerySearch(where, ["name", "ean"]);
            const filtered = store.list().filter((product) => {
                const normalizedWhere = where as
                    | { deactivatedAt?: Date | null; deletedAt?: Date | null }
                    | undefined;
                const activeMatches =
                    (normalizedWhere?.deactivatedAt === undefined ||
                        normalizedWhere.deactivatedAt === product.deactivatedAt) &&
                    (normalizedWhere?.deletedAt === undefined ||
                        normalizedWhere.deletedAt === product.deletedAt);

                return activeMatches && matchesProductSearch(product, search);
            });

            const ordered = applyOrderByCreatedAt(filtered, args?.orderBy);
            return paginate(ordered, args?.skip, args?.take);
        }),
        findUnique: vi.fn(async (args: Parameters<TestProductDelegate["findUnique"]>[0]) => {
            const where = args.where ?? {};
            const record =
                where.id !== undefined
                    ? store.findById(where.id)
                    : where.ean !== undefined
                      ? store.findOne((product) => product.ean === where.ean)
                      : undefined;

            if (record === undefined) {
                return null;
            }

            return selectFields(record, args.select);
        }),
        create: vi.fn(async (args: Parameters<TestProductDelegate["create"]>[0]) => {
            const created = createProductRecord(args.data);
            return store.insert(created);
        }),
        update: vi.fn(async (args: Parameters<TestProductDelegate["update"]>[0]) => {
            const updated = store.updateById(args.where.id, (current) => ({
                ...current,
                ...args.data,
                salePrice: args.data.salePrice !== undefined
                    ? cloneDecimalValue(args.data.salePrice)
                    : current.salePrice,
                updatedAt: new Date(),
            }));

            if (updated === undefined) {
                throw new Error(`Product ${args.where.id} not found`);
            }

            return updated;
        }),
    } as unknown as TestProductDelegate;

    return delegate;
}

function createInventoryMovementDelegate(
    store: MemoryStore<TestInventoryMovementRecord>,
) {
    const delegate = {
        findMany: vi.fn(async (
            args: Parameters<TestInventoryMovementDelegate["findMany"]>[0],
        ) => {
            const ids = args.where?.productId?.in;
            const filtered = ids === undefined
                ? store.list()
                : store.list().filter((movement) => ids.includes(movement.productId));

            return filtered.map((movement) =>
                selectFields(movement, args.select),
            );
        }),
    } as unknown as TestInventoryMovementDelegate;

    return delegate;
}

export function createTestPrisma(
    seed: Partial<TestPrismaSeed> = {},
): TestPrismaMock {
    const userStore = new MemoryStore<TestUserRecord>(seed.users ?? usersFixture);
    const productStore = new MemoryStore<TestProductRecord>(
        seed.products ?? productsFixture,
    );
    const inventoryMovementStore = new MemoryStore<TestInventoryMovementRecord>(
        seed.inventoryMovements ?? inventoryMovementsFixture,
    );

    return {
        user: createUserDelegate(userStore),
        product: createProductDelegate(productStore),
        inventoryMovement: createInventoryMovementDelegate(
            inventoryMovementStore,
        ),
    };
}
