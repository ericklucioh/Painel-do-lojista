import { z } from "zod";
import { SaleItemInputSchema } from "../sales-products/sales-products.schema";

export const CreateSaleBodySchema = z.object({
    cashRegisterId: z.string().trim().min(1),
    discountAmount: z.coerce.number().nonnegative().default(0),
    paymentMethod: z.literal("DINHEIRO"),
    items: z.array(SaleItemInputSchema).min(1),
});

export const PrintReceiptBodySchema = z.object({
    saleId: z.string().trim().min(1),
});

export const SaleIdParamsSchema = z.object({
    id: z.string().trim().min(1),
});

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
    message: z.string().optional(),
});

export const CancelSaleResponseSchema = z.object({
    success: z.literal(true),
    saleId: z.string(),
    status: z.literal("CANCELLED"),
    reverted: z.literal(true),
    sale: SaleDtoSchema.optional(),
});

export type CreateSaleBody = z.infer<typeof CreateSaleBodySchema>;
export type PrintReceiptBody = z.infer<typeof PrintReceiptBodySchema>;
export type SaleIdParams = z.infer<typeof SaleIdParamsSchema>;
export type SaleItem = z.infer<typeof SaleItemSchema>;
export type SaleDto = z.infer<typeof SaleDtoSchema>;
export type CreateSaleResponse = z.infer<typeof CreateSaleResponseSchema>;
export type PrintReceiptResponse = z.infer<typeof PrintReceiptResponseSchema>;
export type CancelSaleResponse = z.infer<typeof CancelSaleResponseSchema>;
