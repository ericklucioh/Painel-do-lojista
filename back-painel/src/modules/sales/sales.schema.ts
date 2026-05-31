import { z } from "zod";

export const SaleItemSchema = z.object({
    id: z.string(),
    productId: z.string(),
    productNameSnapshot: z.string(),
    productEanSnapshot: z.string(),
    unitPriceSnapshot: z.number(),
    quantity: z.number().int().positive(),
    subtotal: z.number(),
});

export const SaleDtoSchema = z.object({
    id: z.string(),
    receiptNumber: z.string(),
    cashRegisterId: z.string(),
    soldByUserId: z.string(),
    soldByUserName: z.string(),
    subtotal: z.number(),
    discountAmount: z.number(),
    totalAmount: z.number(),
    paymentMethod: z.literal("DINHEIRO"),
    status: z.enum(["CONFIRMED", "CANCELLED"]),
    createdAt: z.string(),
    items: z.array(SaleItemSchema),
});

export const CreateSaleResponseSchema = z.object({
    sale: SaleDtoSchema,
});

export const PrintReceiptResponseSchema = z.object({
    success: z.literal(true),
    saleId: z.string().optional(),
});

export const CancelSaleResponseSchema = z.object({
    success: z.literal(true),
    sale: SaleDtoSchema,
});

export type SaleItem = z.infer<typeof SaleItemSchema>;
export type SaleDto = z.infer<typeof SaleDtoSchema>;
export type CreateSaleResponse = z.infer<typeof CreateSaleResponseSchema>;
export type PrintReceiptResponse = z.infer<typeof PrintReceiptResponseSchema>;
export type CancelSaleResponse = z.infer<typeof CancelSaleResponseSchema>;
