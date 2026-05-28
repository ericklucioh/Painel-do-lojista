import { api } from "@/lib/api";
import type {
    AuthLoginInput,
    AuthLoginResponse,
    AuthRefreshResponse,
} from "@/types/api";

export const authService = {
    login: async (payload: AuthLoginInput) => {
        const response = await api.post<AuthLoginResponse>(
            "/api/auth/login",
            payload,
        );
        return response.data;
    },
    refreshSession: async () => {
        const response =
            await api.post<AuthRefreshResponse>("/api/auth/refresh");
        return response.data;
    },
};
