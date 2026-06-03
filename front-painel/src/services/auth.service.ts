import axios from "axios";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthLoginInput, AuthUser } from "@/types/api";

type AuthResponse = {
    user: AuthUser;
};

type AuthErrorResponse = {
    message?: string;
};

function extractAuthUser(
    responseData: unknown,
    fallbackMessage: string,
): AuthUser {
    const data = responseData as AuthResponse | { message?: string } | null;

    if (!data || !("user" in data) || !data.user) {
        throw new Error(
            data && "message" in data && typeof data.message === "string"
                ? data.message
                : fallbackMessage,
        );
    }

    return data.user;
}

function extractAuthErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (!axios.isAxiosError<AuthErrorResponse>(error)) {
        return error instanceof Error ? error.message : fallbackMessage;
    }

    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim().length > 0) {
        return message;
    }

    return error.message || fallbackMessage;
}

export const authService = {
    login: async (payload: AuthLoginInput) => {
        try {
            const response = await authClient.post<AuthResponse>(
                "/login",
                payload,
            );
            const user = extractAuthUser(
                response.data,
                "Não foi possível entrar no sistema.",
            );

            useAuthStore.getState().setSession(user);
            return user;
        } catch (error) {
            throw new Error(
                extractAuthErrorMessage(
                    error,
                    "Não foi possível entrar no sistema.",
                ),
            );
        }
    },
    refreshSession: async () => {
        try {
            const response = await authClient.post<AuthResponse>("/refresh");
            const user = extractAuthUser(
                response.data,
                "Não foi possível renovar a sessão.",
            );

            useAuthStore.getState().setSession(user);
            return user;
        } catch (error) {
            useAuthStore.getState().clearSession();
            throw new Error(
                extractAuthErrorMessage(
                    error,
                    "Não foi possível renovar a sessão.",
                ),
            );
        }
    },
    logout: async () => {
        try {
            await authClient.post("/logout");
        } catch (error) {
            throw new Error(
                extractAuthErrorMessage(
                    error,
                    "Não foi possível sair do sistema.",
                ),
            );
        } finally {
            useAuthStore.getState().clearSession();
        }
    },
};
