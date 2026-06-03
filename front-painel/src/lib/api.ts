import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types/api";

const baseURL = "/api/backend";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

let refreshPromise: Promise<AuthUser> | null = null;

function isBrowser(): boolean {
    return typeof window !== "undefined";
}

function redirectToLogin(): void {
    if (!isBrowser()) {
        return;
    }

    if (window.location.pathname === "/login") {
        return;
    }

    window.location.assign("/login");
}

async function refreshSessionOnce(): Promise<void> {
    if (refreshPromise === null) {
        refreshPromise = authService.refreshSession().finally(() => {
            refreshPromise = null;
        });
    }

    await refreshPromise;
}

export const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as
            | RetryableRequestConfig
            | undefined;

        if (status !== 401 || originalRequest === undefined) {
            return Promise.reject(error);
        }

        if (originalRequest._retry === true) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            await refreshSessionOnce();
            return api(originalRequest);
        } catch (refreshError) {
            redirectToLogin();
            return Promise.reject(refreshError);
        }
    },
);
