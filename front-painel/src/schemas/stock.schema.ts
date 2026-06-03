import { z } from "zod";

export const StockEntryFormSchema = z.object({
    productId: z.string().min(1, "Selecione um produto"),
    type: z.enum(["COMPRA", "DEVOLUCAO", "OUTROS"]),
    quantity: z.number().int().positive("Informe uma quantidade válida"),
    note: z.string().trim().max(180, "Observação muito longa").optional(),
});

export const StockExitFormSchema = z.object({
    productId: z.string().min(1, "Selecione um produto"),
    type: z.enum(["DANIFICADO", "PERDA"]),
    quantity: z.number().int().positive("Informe uma quantidade válida"),
    note: z.string().trim().max(180, "Observação muito longa").optional(),
});

export type StockEntryFormValues = z.infer<typeof StockEntryFormSchema>;
export type StockExitFormValues = z.infer<typeof StockExitFormSchema>;
