import { z } from "zod";

export const ProductFormSchema = z
    .object({
        ean: z
            .string()
            .regex(/^\d{13}$/, "Informe um EAN com 13 dígitos numéricos"),
        name: z.string().min(2, "Informe o nome do produto"),
        price: z.number().positive("Preço deve ser maior que zero"),
        minStock: z
            .number()
            .int()
            .nonnegative("Informe um estoque mínimo válido"),
        maxStock: z.number().int().positive("Informe um estoque máximo válido"),
    })
    .refine((values) => values.minStock < values.maxStock, {
        message: "O estoque mínimo deve ser menor que o estoque máximo",
        path: ["minStock"],
    });

export type ProductFormValues = z.infer<typeof ProductFormSchema>;
