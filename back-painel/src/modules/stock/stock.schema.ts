import { z } from "zod";

export const StockMovementSchema = z.object({
    id: z.string(),
    type: z.enum(["ENTRY", "EXIT"]),
    reason: z.string(),
    quantity: z.number().int().positive(),
    balanceAfter: z.number().int(),
    note: z.string().nullable(),
    createdAt: z.string(),
});

export const StockHistoryResponseSchema = z.object({
    product: z.object({
        id: z.string(),
        ean: z.string(),
        name: z.string(),
    }),
    data: z.array(StockMovementSchema),
});

export type StockMovement = z.infer<typeof StockMovementSchema>;
export type StockHistoryResponse = z.infer<typeof StockHistoryResponseSchema>;
