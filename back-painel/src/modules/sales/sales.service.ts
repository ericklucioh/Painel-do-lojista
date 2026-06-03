import { Prisma, PrismaClient } from "@prisma/client";
import { createHttpError } from "../../utils/httpError";
import type { SalesProductsService } from "../sales-products/sales-products.service";
import type { SaleItemInput } from "../sales-products/sales-products.schema";
import type {
    CancelSaleResponse,
    CreateSaleResponse,
    PrintReceiptResponse,
    SaleDto,
    SaleItem,
} from "./sales.schema";

type SaleItemRecord = {
    id: string;
    productId: string;
    productNameSnapshot: string;
    productEanSnapshot: string;
    unitPriceSnapshot: number | Prisma.Decimal;
    quantity: number;
    subtotal: number | Prisma.Decimal;
};

type SaleRecord = {
    id: string;
    receiptNumber: number;
    cashRegisterId: string;
    soldByUserId: string;
    subtotal: number | Prisma.Decimal;
    discountAmount: number | Prisma.Decimal;
    totalAmount: number | Prisma.Decimal;
    paymentMethod: "DINHEIRO";
    status: "CONFIRMADA" | "CANCELADA";
    createdAt: Date;
    soldByUser: {
        fullName: string;
    };
};

type SaleWithItemsRecord = SaleRecord & {
    items: SaleItemRecord[];
};

export interface CreateSaleInput {
    cashRegisterId: string;
    discountAmount: number;
    paymentMethod: "DINHEIRO";
    items: ReadonlyArray<SaleItemInput>;
    soldByUserId: string;
    soldByUserName: string;
}

export interface PrintReceiptInput {
    saleId: string;
}

export interface CancelSaleInput {
    saleId: string;
    cancelledByUserId: string;
    cancelledByUserName: string;
}

export interface SalesService {
    create(input: CreateSaleInput): Promise<CreateSaleResponse>;
    printReceipt(input: PrintReceiptInput): Promise<PrintReceiptResponse>;
    cancel(input: CancelSaleInput): Promise<CancelSaleResponse>;
}

export interface CreateSalesServiceDependencies {
    prisma: PrismaClient;
    salesProductsService: SalesProductsService;
}

function toNumber(value: number | Prisma.Decimal): number {
    return typeof value === "number" ? value : value.toNumber();
}

function roundCurrency(value: number): number {
    return Number(value.toFixed(2));
}

function toDecimal(value: number): Prisma.Decimal {
    return new Prisma.Decimal(roundCurrency(value));
}

function mapSaleStatus(status: SaleRecord["status"]): SaleDto["status"] {
    return status === "CONFIRMADA" ? "CONFIRMED" : "CANCELLED";
}

function formatReceiptNumber(receiptNumber: number): string {
    return receiptNumber.toString().padStart(3, "0");
}

function mapSaleItem(item: SaleItemRecord): SaleItem {
    return {
        id: item.id,
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        productEanSnapshot: item.productEanSnapshot,
        unitPriceSnapshot: roundCurrency(toNumber(item.unitPriceSnapshot)),
        quantity: item.quantity,
        subtotal: roundCurrency(toNumber(item.subtotal)),
    };
}

function toSaleDto(sale: SaleWithItemsRecord): SaleDto {
    return {
        id: sale.id,
        receiptNumber: formatReceiptNumber(sale.receiptNumber),
        cashRegisterId: sale.cashRegisterId,
        soldByUserId: sale.soldByUserId,
        soldByUserName: sale.soldByUser.fullName,
        subtotal: roundCurrency(toNumber(sale.subtotal)),
        discountAmount: roundCurrency(toNumber(sale.discountAmount)),
        totalAmount: roundCurrency(toNumber(sale.totalAmount)),
        paymentMethod: sale.paymentMethod,
        status: mapSaleStatus(sale.status),
        createdAt: sale.createdAt.toISOString(),
        items: sale.items.map(mapSaleItem),
    };
}

function sumSubtotals(items: ReadonlyArray<{ subtotal: number }>): number {
    return roundCurrency(
        items.reduce((total, item) => total + item.subtotal, 0),
    );
}

function buildInventoryMovements(
    saleId: string,
    userId: string,
    items: ReadonlyArray<SaleItemRecord>,
    type: "VENDA" | "DEVOLUCAO",
): Array<{
    productId: string;
    userId: string;
    type: "VENDA" | "DEVOLUCAO";
    quantity: number;
    note: string;
    saleId: string;
}> {
    return items.map((item) => ({
        productId: item.productId,
        userId,
        type,
        quantity: item.quantity,
        note: type === "VENDA" ? "Venda registrada" : "Cancelamento da venda",
        saleId,
    }));
}

export function createSalesService({
    prisma,
    salesProductsService,
}: CreateSalesServiceDependencies): SalesService {
    return {
        async create(input) {
            const createdSale = await prisma.$transaction(async (tx) => {
                const cashRegister = await tx.cashRegister.findFirst({
                    where: {
                        id: input.cashRegisterId,
                        status: "ABERTO",
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                    },
                });

                if (cashRegister === null) {
                    throw createHttpError("Caixa não encontrado", 404);
                }

                const resolvedItems =
                    await salesProductsService.resolveSaleItems(
                        tx,
                        input.items,
                    );

                const subtotal = sumSubtotals(resolvedItems);
                const discountAmount = roundCurrency(input.discountAmount);

                if (discountAmount > subtotal) {
                    throw createHttpError("Desconto inválido", 400);
                }

                const totalAmount = roundCurrency(subtotal - discountAmount);
                const lastSale = await tx.sale.findFirst({
                    orderBy: {
                        receiptNumber: "desc",
                    },
                    select: {
                        receiptNumber: true,
                    },
                });
                const receiptNumber = (lastSale?.receiptNumber ?? 0) + 1;

                const sale = await tx.sale.create({
                    data: {
                        receiptNumber,
                        cashRegisterId: input.cashRegisterId,
                        soldByUserId: input.soldByUserId,
                        subtotal: toDecimal(subtotal),
                        discountAmount: toDecimal(discountAmount),
                        totalAmount: toDecimal(totalAmount),
                        paymentMethod: input.paymentMethod,
                        status: "CONFIRMADA",
                    },
                });

                const createdItems: SaleItemRecord[] = [];
                for (const item of resolvedItems) {
                    const createdItem = (await tx.saleItem.create({
                        data: {
                            saleId: sale.id,
                            productId: item.productId,
                            productNameSnapshot: item.productNameSnapshot,
                            productEanSnapshot: item.productEanSnapshot,
                            unitPriceSnapshot: toDecimal(
                                item.unitPriceSnapshot,
                            ),
                            quantity: item.quantity,
                            subtotal: toDecimal(item.subtotal),
                        },
                    })) as SaleItemRecord;

                    createdItems.push(createdItem);
                }

                for (const movement of buildInventoryMovements(
                    sale.id,
                    input.soldByUserId,
                    createdItems,
                    "VENDA",
                )) {
                    await tx.inventoryMovement.create({
                        data: movement,
                    });
                }

                await tx.cashMovement.create({
                    data: {
                        cashRegisterId: input.cashRegisterId,
                        saleId: sale.id,
                        type: "VENDA",
                        amount: toDecimal(totalAmount),
                        note: "Venda confirmada",
                        createdByUserId: input.soldByUserId,
                    },
                });

                const persistedSale = (await tx.sale.findUnique({
                    where: {
                        id: sale.id,
                    },
                    include: {
                        soldByUser: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                })) as SaleRecord | null;

                if (persistedSale === null) {
                    throw createHttpError("Venda não encontrada", 404);
                }

                return {
                    ...persistedSale,
                    items: createdItems,
                } satisfies SaleWithItemsRecord;
            });

            return {
                sale: toSaleDto(createdSale),
            };
        },

        async printReceipt(input) {
            const sale = await prisma.sale.findUnique({
                where: {
                    id: input.saleId,
                },
                select: {
                    id: true,
                },
            });

            if (sale === null) {
                throw createHttpError("Venda não encontrada", 404);
            }

            return {
                success: true,
                saleId: sale.id,
                message: "Recibo impresso com sucesso",
            };
        },

        async cancel(input) {
            const cancelledSale = await prisma.$transaction(async (tx) => {
                const sale = (await tx.sale.findUnique({
                    where: {
                        id: input.saleId,
                    },
                    include: {
                        soldByUser: {
                            select: {
                                fullName: true,
                            },
                        },
                        items: true,
                    },
                })) as SaleWithItemsRecord | null;

                if (sale === null) {
                    throw createHttpError("Venda não encontrada", 404);
                }

                if (sale.status === "CANCELADA") {
                    throw createHttpError("Venda já cancelada", 400);
                }

                const now = new Date();
                const updatedSale = (await tx.sale.update({
                    where: {
                        id: sale.id,
                    },
                    data: {
                        status: "CANCELADA",
                        cancelledAt: now,
                        cancelReason: "Cancelamento solicitado",
                    },
                    include: {
                        soldByUser: {
                            select: {
                                fullName: true,
                            },
                        },
                        items: true,
                    },
                })) as SaleWithItemsRecord;

                for (const movement of buildInventoryMovements(
                    sale.id,
                    input.cancelledByUserId,
                    sale.items,
                    "DEVOLUCAO",
                )) {
                    await tx.inventoryMovement.create({
                        data: movement,
                    });
                }

                await tx.cashMovement.create({
                    data: {
                        cashRegisterId: sale.cashRegisterId,
                        saleId: sale.id,
                        type: "CANCELAMENTO",
                        amount: toDecimal(toNumber(sale.totalAmount)),
                        note: `Cancelamento por ${input.cancelledByUserName}`,
                        createdByUserId: input.cancelledByUserId,
                    },
                });

                return updatedSale;
            });

            return {
                success: true,
                saleId: cancelledSale.id,
                status: "CANCELLED",
                reverted: true,
                sale: toSaleDto(cancelledSale),
            };
        },
    };
}
