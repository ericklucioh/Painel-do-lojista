import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { AuthRefreshResponse } from "@/types/api";
import { clearAuthSessionCookie } from "@/lib/auth-session";
import { useAuthStore } from "@/stores/auth.store";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

type RetryableConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

const authEndpoints = ["/api/auth/login", "/api/auth/refresh"];

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as RetryableConfig | undefined;
        const requestUrl = originalRequest?.url ?? "";

        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            authEndpoints.some((endpoint) => requestUrl.includes(endpoint))
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshApi
                    .post<AuthRefreshResponse>("/api/auth/refresh")
                    .then(() => undefined)
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            await refreshPromise;
            return api.request(originalRequest);
        } catch (refreshError) {
            clearAuthSessionCookie();
            useAuthStore.getState().clearSession();

            if (typeof window !== "undefined") {
                window.location.assign("/login");
            }

            return Promise.reject(refreshError);
        }
    },
);
