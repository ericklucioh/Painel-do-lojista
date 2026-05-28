import type { UserRole } from "@/types/api";

type JwtPayload = {
    sub?: string;
    nome?: string;
    tipo?: UserRole;
    exp?: number;
};

function decodeBase64Url(value: string) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    if (typeof atob !== "function") {
        return null;
    }

    try {
        return atob(padded);
    } catch {
        return null;
    }
}

export function decodeJwtPayload<T extends object>(token: string): T | null {
    const [, payload] = token.split(".");

    if (!payload) {
        return null;
    }

    const decoded = decodeBase64Url(payload);
    if (!decoded) {
        return null;
    }

    try {
        return JSON.parse(decoded) as T;
    } catch {
        return null;
    }
}

export function getUserRoleFromToken(token: string): UserRole | null {
    const payload = decodeJwtPayload<JwtPayload>(token);

    return payload?.tipo ?? null;
}
