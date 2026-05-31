import type { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
import type {
    CreateProductBody,
    CreateProductResponse,
    DeactivateProductResponse,
    ProductByEanResponse,
    ProductDetailResponse,
    ProductListItemResponse,
    ProductQuery,
    ProductsListResponse,
    UpdateProductBody,
    UpdateProductResponse,
} from "./products.schema";

type ProductRecord = {
    id: string;
    ean: string;
    name: string;
    salePrice: number | { toNumber(): number };
    minStock: number;
    maxStock: number;
    deactivatedAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

type InventoryMovementRecord = {
    productId: string;
    type:
        | "COMPRA"
        | "DEVOLUCAO"
        | "DANIFICADO"
        | "PERDA"
        | "VENDA"
        | "AJUSTE_ENTRADA"
        | "AJUSTE_SAIDA";
    quantity: number;
};

export interface ProductsService {
    list(query: ProductQuery): Promise<ProductsListResponse>;
    getByEan(ean: string): Promise<ProductByEanResponse | undefined>;
    create(input: CreateProductBody): Promise<CreateProductResponse>;
    update(
        id: string,
        input: UpdateProductBody,
    ): Promise<UpdateProductResponse>;
    deactivate(id: string): Promise<DeactivateProductResponse>;
}

export interface CreateProductsServiceDependencies {
    prisma: Pick<PrismaClient, "product" | "inventoryMovement">;
}

function isActive(product: ProductRecord): boolean {
    return product.deactivatedAt === null && product.deletedAt === null;
}

function toPrice(value: ProductRecord["salePrice"]): number {
    return typeof value === "number" ? value : value.toNumber();
}

function calculateMovementDelta(
    type: InventoryMovementRecord["type"],
    quantity: number,
): number {
    switch (type) {
        case "COMPRA":
        case "DEVOLUCAO":
        case "AJUSTE_ENTRADA":
            return quantity;
        case "DANIFICADO":
        case "PERDA":
        case "VENDA":
        case "AJUSTE_SAIDA":
            return -quantity;
        default:
            return 0;
    }
}

function calculateStockCurrent(
    productId: string,
    movements: ReadonlyArray<InventoryMovementRecord>,
): number {
    return movements
        .filter((movement) => movement.productId === productId)
        .reduce(
            (total, movement) =>
                total +
                calculateMovementDelta(movement.type, movement.quantity),
            0,
        );
}

function deriveIsCritical(
    item: Pick<ProductListItemResponse, "stockCurrent" | "minStock">,
): boolean {
    return item.stockCurrent <= item.minStock;
}

function toListItem(
    product: ProductRecord,
    stockCurrent: number,
): ProductListItemResponse {
    const item = {
        id: product.id,
        ean: product.ean,
        name: product.name,
        price: toPrice(product.salePrice),
        stockCurrent,
        minStock: product.minStock,
        maxStock: product.maxStock,
        isCritical: deriveIsCritical({
            stockCurrent,
            minStock: product.minStock,
        }),
        isActive: isActive(product),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
    };

    return item;
}

function toDetailItem(
    product: ProductRecord,
    stockCurrent: number,
): ProductDetailResponse {
    return {
        ...toListItem(product, stockCurrent),
        deletedAt: product.deletedAt?.toISOString() ?? null,
    };
}

function toByEanItem(
    product: ProductRecord,
    stockCurrent: number,
): ProductByEanResponse {
    return {
        id: product.id,
        ean: product.ean,
        name: product.name,
        price: toPrice(product.salePrice),
        stockCurrent,
        isActive: isActive(product),
    };
}

function normalizeSearch(search: string | undefined): string | undefined {
    const normalized = search?.trim().toLowerCase();
    return normalized === undefined || normalized.length === 0
        ? undefined
        : normalized;
}

function buildActiveWhere(search?: string) {
    return {
        deactivatedAt: null,
        deletedAt: null,
        ...(search === undefined
            ? {}
            : {
                  OR: [
                      {
                          name: {
                              contains: search,
                          },
                      },
                      {
                          ean: {
                              contains: search,
                          },
                      },
                  ],
              }),
    };
}

async function loadMovements(
    prisma: CreateProductsServiceDependencies["prisma"],
    productIds: ReadonlyArray<string>,
): Promise<InventoryMovementRecord[]> {
    if (productIds.length === 0) {
        return [];
    }

    return prisma.inventoryMovement.findMany({
        where: {
            productId: {
                in: productIds,
            },
        },
        select: {
            productId: true,
            type: true,
            quantity: true,
        },
    }) as Promise<InventoryMovementRecord[]>;
}

export function createProductsService({
    prisma,
}: CreateProductsServiceDependencies): ProductsService {
    const pageSize = 10;

    return {
        async list(query) {
            const search = normalizeSearch(query.search);
            const where = buildActiveWhere(search);

            const totalItems = await prisma.product.count({ where });

            const totalPages =
                totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
            const page = Math.min(query.page, Math.max(totalPages, 1));

            const products = (await prisma.product.findMany({
                where,
                orderBy: {
                    createdAt: "asc",
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })) as ProductRecord[];

            const movementRows = await loadMovements(
                prisma,
                products.map((product) => product.id),
            );
            const stockByProductId = new Map<string, number>();

            for (const movement of movementRows) {
                const nextValue =
                    (stockByProductId.get(movement.productId) ?? 0) +
                    calculateMovementDelta(movement.type, movement.quantity);
                stockByProductId.set(movement.productId, nextValue);
            }

            return {
                data: products.map((product) =>
                    toListItem(
                        product as ProductRecord,
                        stockByProductId.get(product.id) ?? 0,
                    ),
                ),
                page,
                pageSize,
                totalItems,
                totalPages,
                ...(query.search === undefined ? {} : { search: query.search }),
            };
        },

        async getByEan(ean) {
            const product = (await prisma.product.findUnique({
                where: {
                    ean,
                },
            })) as ProductRecord | null;

            if (product === null) {
                return undefined;
            }

            if (!isActive(product as ProductRecord)) {
                throw createHttpError("Produto não disponível para venda", 404);
            }

            const movementRows = await loadMovements(prisma, [product.id]);
            const stockCurrent = calculateStockCurrent(
                product.id,
                movementRows,
            );

            return toByEanItem(product as ProductRecord, stockCurrent);
        },

        async create(input) {
            const existingProduct = (await prisma.product.findUnique({
                where: {
                    ean: input.ean,
                },
                select: {
                    id: true,
                },
            })) as { id: string } | null;

            if (existingProduct !== null) {
                throw createHttpError("Este EAN já existe", 400);
            }

            const createdProduct = await prisma.product.create({
                data: {
                    ean: input.ean,
                    name: input.name,
                    salePrice: input.price,
                    minStock: input.minStock,
                    maxStock: input.maxStock,
                    deactivatedAt: null,
                    deletedAt: null,
                },
            });

            return {
                product: toDetailItem(createdProduct as ProductRecord, 0),
            };
        },

        async update(id, input) {
            const currentProduct = (await prisma.product.findUnique({
                where: {
                    id,
                },
            })) as ProductRecord | null;

            if (
                currentProduct === null ||
                !isActive(currentProduct as ProductRecord)
            ) {
                throw createHttpError("Product not found", 404);
            }

            if (input.ean !== undefined && input.ean !== currentProduct.ean) {
                const duplicateProduct = (await prisma.product.findUnique({
                    where: {
                        ean: input.ean,
                    },
                    select: {
                        id: true,
                    },
                })) as { id: string } | null;

                if (
                    duplicateProduct !== null &&
                    duplicateProduct.id !== currentProduct.id
                ) {
                    throw createHttpError("Este EAN já existe", 400);
                }
            }

            const updatedProduct = await prisma.product.update({
                where: {
                    id,
                },
                data: {
                    ean: input.ean ?? currentProduct.ean,
                    name: input.name ?? currentProduct.name,
                    salePrice: input.price ?? currentProduct.salePrice,
                    minStock: input.minStock ?? currentProduct.minStock,
                    maxStock: input.maxStock ?? currentProduct.maxStock,
                },
            });

            const movementRows = await loadMovements(prisma, [
                updatedProduct.id,
            ]);
            const stockCurrent = calculateStockCurrent(
                updatedProduct.id,
                movementRows,
            );

            return {
                product: toDetailItem(
                    updatedProduct as ProductRecord,
                    stockCurrent,
                ),
            };
        },

        async deactivate(id) {
            const currentProduct = (await prisma.product.findUnique({
                where: {
                    id,
                },
            })) as ProductRecord | null;

            if (
                currentProduct === null ||
                !isActive(currentProduct as ProductRecord)
            ) {
                throw createHttpError("Product not found", 404);
            }

            const now = new Date();
            const deactivatedProduct = await prisma.product.update({
                where: {
                    id,
                },
                data: {
                    deactivatedAt: now,
                    deletedAt: now,
                },
            });

            const movementRows = await loadMovements(prisma, [
                deactivatedProduct.id,
            ]);
            const stockCurrent = calculateStockCurrent(
                deactivatedProduct.id,
                movementRows,
            );

            return {
                success: true,
                product: toDetailItem(
                    deactivatedProduct as ProductRecord,
                    stockCurrent,
                ),
            };
        },
    };
}
