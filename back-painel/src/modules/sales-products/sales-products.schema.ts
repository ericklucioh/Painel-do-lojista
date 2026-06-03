import { z } from "zod";

export const SaleItemInputSchema = z.object({
    productId: z.string().trim().min(1),
    quantity: z.coerce.number().int().positive(),
});

export const ResolvedSaleItemSchema = z.object({
    productId: z.string(),
    productNameSnapshot: z.string(),
    productEanSnapshot: z.string(),
    unitPriceSnapshot: z.number(),
    quantity: z.number().int().positive(),
    subtotal: z.number(),
});

export type SaleItemInput = z.infer<typeof SaleItemInputSchema>;
export type ResolvedSaleItem = z.infer<typeof ResolvedSaleItemSchema>;
