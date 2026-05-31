import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    CancelSaleResponseSchema,
    CreateSaleResponseSchema,
    PrintReceiptResponseSchema,
} from "./sales.schema";

export interface SalesController {
    create: RequestHandler;
    printReceipt: RequestHandler;
    cancel: RequestHandler;
}

export interface CreateSalesControllerDependencies {}

function toNumber(value: unknown): number {
    return Number(value);
}

export function createSalesController(): SalesController {
    return {
        create: asyncHandler(async (req, res) => {
            const body = req.body as {
                cashRegisterId?: string;
                items?: Array<{
                    productId?: string;
                    quantity?: number;
                }>;
                discountAmount?: number;
                paymentMethod?: "DINHEIRO";
            };

            const items = (body.items ?? []).map((item, index) => ({
                id: `sale_item_${index + 1}`,
                productId: item.productId ?? "",
                productNameSnapshot: `Produto ${item.productId ?? index + 1}`,
                productEanSnapshot: `ean-${index + 1}`,
                unitPriceSnapshot: 0,
                quantity: item.quantity ?? 0,
                subtotal: 0,
            }));

            const response = CreateSaleResponseSchema.parse({
                sale: {
                    id: "sale_fake_1",
                    receiptNumber: "001",
                    cashRegisterId: body.cashRegisterId ?? "",
                    soldByUserId: req.authUser?.sub ?? "",
                    soldByUserName: req.authUser?.nome ?? "",
                    subtotal: items.reduce(
                        (total, item) => total + item.subtotal,
                        0,
                    ),
                    discountAmount: toNumber(body.discountAmount ?? 0),
                    totalAmount: 0,
                    paymentMethod: body.paymentMethod ?? "DINHEIRO",
                    status: "CONFIRMED",
                    createdAt: new Date().toISOString(),
                    items,
                },
            });

            res.status(201).json(response);
        }),

        printReceipt: asyncHandler(async (req, res) => {
            const saleId = String(
                (req.body as { saleId?: string }).saleId ?? "",
            );

            const response = PrintReceiptResponseSchema.parse({
                success: true,
                saleId,
            });

            res.status(200).json(response);
        }),

        cancel: asyncHandler(async (req, res) => {
            const saleId = req.params.id;

            const response = CancelSaleResponseSchema.parse({
                success: true,
                sale: {
                    id: saleId,
                    receiptNumber: "001",
                    cashRegisterId: "cash_register_fake_1",
                    soldByUserId: req.authUser?.sub ?? "",
                    soldByUserName: req.authUser?.nome ?? "",
                    subtotal: 0,
                    discountAmount: 0,
                    totalAmount: 0,
                    paymentMethod: "DINHEIRO",
                    status: "CANCELLED",
                    createdAt: new Date().toISOString(),
                    items: [],
                },
            });

            res.status(200).json(response);
        }),
    };
}
