import { z } from "zod";

export const OpenCashRegisterFormSchema = z.object({
    initialBalance: z.number().positive("Informe um saldo inicial válido"),
    note: z.string().trim().max(180, "Observação muito longa").optional(),
});

export type OpenCashRegisterFormValues = z.infer<
    typeof OpenCashRegisterFormSchema
>;
