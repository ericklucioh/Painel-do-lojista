import type { AuthLoginInput, AuthUser } from "@/types/api";

export const authService = {
    login: async (payload: AuthLoginInput) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const body = (await response.json().catch(() => null)) as {
            user?: AuthUser;
            message?: string;
        } | null;

        if (!response.ok) {
            throw new Error(
                body?.message ?? "Não foi possível entrar no sistema.",
            );
        }

        if (!body?.user) {
            throw new Error("Não foi possível entrar no sistema.");
        }

        return body;
    },
    refreshSession: async () => {
        const response = await fetch("/api/auth/refresh", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("Não foi possível renovar a sessão.");
        }

        return response.json().catch(() => ({ ok: true }));
    },
    logout: async () => {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("Não foi possível sair do sistema.");
        }
    },
};
