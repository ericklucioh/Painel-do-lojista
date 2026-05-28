import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(1, "Informe a senha"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
