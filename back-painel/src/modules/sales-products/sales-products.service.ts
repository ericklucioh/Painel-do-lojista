import type { PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
import type { ResolvedSaleItem, SaleItemInput } from "./sales-products.schema";

type ProductRecord = {
    id: string;
    ean: string;
    name: string;
    salePrice: number | { toNumber(): number };
    deactivatedAt: Date | null;
    deletedAt: Date | null;
};

export interface SalesProductsService {
    resolveSaleItems(
        prisma: Pick<PrismaClient, "product">,
        items: ReadonlyArray<SaleItemInput>,
    ): Promise<ResolvedSaleItem[]>;
}

function toNumber(value: ProductRecord["salePrice"]): number {
    return typeof value === "number" ? value : value.toNumber();
}

function roundCurrency(value: number): number {
    return Number(value.toFixed(2));
}

function isActive(product: ProductRecord): boolean {
    return product.deactivatedAt === null && product.deletedAt === null;
}

export function createSalesProductsService(): SalesProductsService {
    return {
        async resolveSaleItems(prisma, items) {
            const uniqueProductIds = Array.from(
                new Set(items.map((item) => item.productId)),
            );

            const products = (await prisma.product.findMany({
                where: {
                    id: {
                        in: uniqueProductIds,
                    },
                },
                select: {
                    id: true,
                    ean: true,
                    name: true,
                    salePrice: true,
                    deactivatedAt: true,
                    deletedAt: true,
                },
            })) as ProductRecord[];

            const productById = new Map<string, ProductRecord>(
                products.map((product) => [product.id, product]),
            );

            return items.map((item) => {
                const product = productById.get(item.productId);

                if (product === undefined || !isActive(product)) {
                    throw createHttpError(
                        "Produto não encontrado para venda",
                        404,
                    );
                }

                const unitPriceSnapshot = toNumber(product.salePrice);
                const subtotal = roundCurrency(
                    unitPriceSnapshot * item.quantity,
                );

                return {
                    productId: product.id,
                    productNameSnapshot: product.name,
                    productEanSnapshot: product.ean,
                    unitPriceSnapshot,
                    quantity: item.quantity,
                    subtotal,
                };
            });
        },
    };
}
