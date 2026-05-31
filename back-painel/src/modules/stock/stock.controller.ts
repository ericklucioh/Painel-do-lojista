import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    StockHistoryResponseSchema,
    StockMovementResponseSchema,
} from "./stock.schema";

export interface StockController {
    entry: RequestHandler;
    exit: RequestHandler;
    history: RequestHandler;
}

export interface CreateStockControllerDependencies {}

function sendValidationError(
    res: Parameters<RequestHandler>[1],
    issues: unknown,
): void {
    res.status(400).json({
        message: "Validation error",
        issues,
    });
}

function toNumber(value: unknown): number {
    return Number(value);
}

export function createStockController(): StockController {
    return {
        entry: asyncHandler(async (req, res) => {
            const productId = String((req.body as { productId?: string }).productId ?? "");
            const quantity = toNumber((req.body as { quantity?: unknown }).quantity ?? 0);
            const note = (req.body as { note?: string | null }).note ?? null;
            const reason = note ?? String((req.body as { reason?: string }).reason ?? "ENTRY");

            const response = StockMovementResponseSchema.parse({
                movement: {
                    id: `movement_${productId || "entry"}`,
                    type: "ENTRY",
                    reason,
                    quantity,
                    balanceAfter: quantity,
                    note,
                    createdAt: new Date().toISOString(),
                },
            });

            res.status(201).json(response);
        }),

        exit: asyncHandler(async (req, res) => {
            const productId = String((req.body as { productId?: string }).productId ?? "");
            const quantity = toNumber((req.body as { quantity?: unknown }).quantity ?? 0);
            const note = (req.body as { note?: string | null }).note ?? null;
            const reason = note ?? String((req.body as { reason?: string }).reason ?? "EXIT");

            const response = StockMovementResponseSchema.parse({
                movement: {
                    id: `movement_${productId || "exit"}`,
                    type: "EXIT",
                    reason,
                    quantity,
                    balanceAfter: -quantity,
                    note,
                    createdAt: new Date().toISOString(),
                },
            });

            res.status(201).json(response);
        }),

        history: asyncHandler(async (req, res) => {
            const productId = String(req.query.produto_id ?? "");

            const response = StockHistoryResponseSchema.parse({
                product: {
                    id: productId,
                    ean: "0000000000000",
                    name: "Produto de teste",
                },
                data: [],
            });

            res.status(200).json(response);
        }),
    };
}
