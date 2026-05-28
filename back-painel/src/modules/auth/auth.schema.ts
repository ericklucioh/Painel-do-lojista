import { z } from "zod";

export const AuthUserSchema = z.object({
    id: z.string(),
    nome: z.string(),
    tipo: z.enum(["ADMIN", "VENDEDOR"]),
});

export const AuthLoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const AuthLoginResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().positive(),
    user: AuthUserSchema,
});

export const AuthRefreshInputSchema = z.object({
    refreshToken: z.string().min(1).optional(),
});

export const AuthRefreshResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().positive(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthLoginInput = z.infer<typeof AuthLoginInputSchema>;
export type AuthLoginResponse = z.infer<typeof AuthLoginResponseSchema>;
export type AuthRefreshInput = z.infer<typeof AuthRefreshInputSchema>;
export type AuthRefreshResponse = z.infer<typeof AuthRefreshResponseSchema>;
