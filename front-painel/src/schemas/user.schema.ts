import { z } from "zod";

export const UserRoleSchema = z.enum(["ADMIN", "VENDEDOR"]);

export const UserCreateSchema = z.object({
    fullName: z.string().min(2, "Informe o nome completo"),
    email: z.string().email("Informe um e-mail válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    role: UserRoleSchema,
});

export const UserUpdateSchema = z.object({
    fullName: z.string().min(2, "Informe o nome completo"),
    role: UserRoleSchema,
});

export type UserCreateFormValues = z.infer<typeof UserCreateSchema>;
export type UserUpdateFormValues = z.infer<typeof UserUpdateSchema>;
