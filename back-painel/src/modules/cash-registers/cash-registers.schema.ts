import { z } from "zod";

export const CashRegisterSchema = z.object({
    id: z.string(),
    openedByUserId: z.string(),
    activeOpenedByUserId: z.string().nullable(),
    initialBalance: z.number(),
    status: z.enum(["ABERTO", "FECHADO"]),
    openedAt: z.string(),
    closedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullable(),
});

export const OpenCashRegisterResponseSchema = z.object({
    cashRegister: CashRegisterSchema,
});

export type CashRegisterDto = z.infer<typeof CashRegisterSchema>;
export type OpenCashRegisterResponse = z.infer<
    typeof OpenCashRegisterResponseSchema
>;
