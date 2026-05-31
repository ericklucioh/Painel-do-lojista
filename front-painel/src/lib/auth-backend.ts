import { BACKEND_URL } from "@/lib/auth-config";
import type {
    AuthLoginInput,
    AuthLoginResponse,
    AuthMeResponse,
    AuthRefreshResponse,
    AuthUser,
} from "@/types/api";

type BackendErrorResponse = {
    message?: string;
};

async function readJson<T>(
    response: Response,
): Promise<T | BackendErrorResponse | null> {
    return response.json().catch(() => null);
}

export async function loginOnBackend(payload: AuthLoginInput): Promise<{
    ok: boolean;
    status: number;
    data: AuthLoginResponse | null;
    message: string;
}> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify(payload),
        });

        const body = (await readJson<AuthLoginResponse>(response)) as
            | AuthLoginResponse
            | BackendErrorResponse
            | null;

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok && body && "accessToken" in body ? body : null,
            message:
                body && "message" in body && typeof body.message === "string"
                    ? body.message
                    : "Não foi possível entrar no sistema.",
        };
    } catch {
        return {
            ok: false,
            status: 503,
            data: null,
            message: "Não foi possível entrar no sistema.",
        };
    }
}

export async function refreshOnBackend(refreshToken: string): Promise<{
    ok: boolean;
    status: number;
    data: AuthRefreshResponse | null;
    message: string;
}> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({ refreshToken }),
        });

        const body = (await readJson<AuthRefreshResponse>(response)) as
            | AuthRefreshResponse
            | BackendErrorResponse
            | null;

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok && body && "accessToken" in body ? body : null,
            message:
                body && "message" in body && typeof body.message === "string"
                    ? body.message
                    : "Refresh token inválido",
        };
    } catch {
        return {
            ok: false,
            status: 503,
            data: null,
            message: "Refresh token inválido",
        };
    }
}

export async function logoutOnBackend(refreshToken: string): Promise<{
    ok: boolean;
    status: number;
    message: string;
}> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({ refreshToken }),
        });

        const body = (await readJson<Record<string, unknown>>(response)) as
            | BackendErrorResponse
            | Record<string, unknown>
            | null;

        return {
            ok: response.ok,
            status: response.status,
            message:
                body && "message" in body && typeof body.message === "string"
                    ? body.message
                    : "Não foi possível sair do sistema.",
        };
    } catch {
        return {
            ok: false,
            status: 503,
            message: "Não foi possível sair do sistema.",
        };
    }
}

export async function fetchCurrentUserOnBackend(accessToken: string): Promise<{
    ok: boolean;
    status: number;
    data: AuthUser | null;
    message: string;
}> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
        });

        const body = (await readJson<AuthMeResponse>(response)) as
            | AuthMeResponse
            | AuthUser
            | BackendErrorResponse
            | null;

        let user: AuthUser | null = null;
        if (body) {
            if ("user" in body && body.user) {
                user = body.user;
            } else if ("id" in body && "nome" in body && "tipo" in body) {
                user = body as AuthUser;
            }
        }

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok ? user : null,
            message:
                body && "message" in body && typeof body.message === "string"
                    ? body.message
                    : "Sessão inválida.",
        };
    } catch {
        return {
            ok: false,
            status: 503,
            data: null,
            message: "Sessão inválida.",
        };
    }
}
