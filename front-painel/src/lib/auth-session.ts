import type { AuthUser } from "@/types/api";

export const FRONT_AUTH_SESSION_COOKIE_NAME = "panel_session";
const FRONT_AUTH_SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function isBrowser(): boolean {
    return typeof document !== "undefined";
}

function readCookieValue(cookieSource: string, cookieName: string): string | null {
    const entries = cookieSource.split(";").map((entry) => entry.trim());
    const match = entries.find((entry) => entry.startsWith(`${cookieName}=`));

    if (match === undefined) {
        return null;
    }

    return match.slice(cookieName.length + 1);
}

export function encodeAuthSession(user: AuthUser): string {
    return encodeURIComponent(JSON.stringify(user));
}

export function decodeAuthSession(value: string | null | undefined): AuthUser | null {
    if (value === undefined || value === null || value.trim().length === 0) {
        return null;
    }

    try {
        const decoded = decodeURIComponent(value);
        const parsed = JSON.parse(decoded) as Partial<AuthUser>;

        if (
            typeof parsed.id !== "string" ||
            typeof parsed.nome !== "string" ||
            (parsed.tipo !== "ADMIN" && parsed.tipo !== "VENDEDOR")
        ) {
            return null;
        }

        return {
            id: parsed.id,
            nome: parsed.nome,
            tipo: parsed.tipo,
        };
    } catch {
        return null;
    }
}

export function readAuthSessionFromCookieSource(
    cookieSource: string | null | undefined,
): AuthUser | null {
    if (cookieSource === undefined || cookieSource === null) {
        return null;
    }

    const rawValue = readCookieValue(
        cookieSource,
        FRONT_AUTH_SESSION_COOKIE_NAME,
    );

    return decodeAuthSession(rawValue);
}

export function readAuthSessionFromDocumentCookie(): AuthUser | null {
    if (!isBrowser()) {
        return null;
    }

    return readAuthSessionFromCookieSource(document.cookie);
}

export function writeAuthSessionCookie(user: AuthUser): void {
    if (!isBrowser()) {
        return;
    }

    const secure = window.location.protocol === "https:";
    const parts = [
        `${FRONT_AUTH_SESSION_COOKIE_NAME}=${encodeAuthSession(user)}`,
        "Path=/",
        `Max-Age=${FRONT_AUTH_SESSION_MAX_AGE_SECONDS}`,
        "SameSite=Lax",
    ];

    if (secure) {
        parts.push("Secure");
    }

    document.cookie = parts.join("; ");
}

export function clearAuthSessionCookie(): void {
    if (!isBrowser()) {
        return;
    }

    const secure = window.location.protocol === "https:";
    const parts = [
        `${FRONT_AUTH_SESSION_COOKIE_NAME}=`,
        "Path=/",
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "SameSite=Lax",
    ];

    if (secure) {
        parts.push("Secure");
    }

    document.cookie = parts.join("; ");
}
