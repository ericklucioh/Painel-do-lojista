import type { UserRole } from "@/types/api";
import { JWT_SECRET } from "@/lib/auth-config";

export type AuthTokenPayload = {
    sub?: string;
    email?: string;
    nome?: string;
    tipo?: UserRole;
    exp?: number;
    iat?: number;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function base64UrlEncode(value: ArrayBuffer | Uint8Array | string): string {
    let bytes: Uint8Array;

    if (typeof value === "string") {
        bytes = textEncoder.encode(value);
    } else if (value instanceof Uint8Array) {
        bytes = value;
    } else {
        bytes = new Uint8Array(value);
    }

    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string | null {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    try {
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return textDecoder.decode(bytes);
    } catch {
        return null;
    }
}

function parseJwtParts(token: string):
    | {
          header: string;
          payload: string;
          signature: string;
      }
    | null {
    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    const [header, payload, signature] = parts;
    if (!header || !payload || !signature) {
        return null;
    }

    return { header, payload, signature };
}

async function hmacSha256(input: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        textEncoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        textEncoder.encode(input),
    );

    return base64UrlEncode(signature);
}

export function decodeJwtPayload<T extends object>(token: string): T | null {
    const parts = parseJwtParts(token);
    if (!parts) {
        return null;
    }

    const decoded = base64UrlDecode(parts.payload);
    if (!decoded) {
        return null;
    }

    try {
        return JSON.parse(decoded) as T;
    } catch {
        return null;
    }
}

function decodeJwtSegment<T extends object>(segment: string): T | null {
    const decoded = base64UrlDecode(segment);
    if (!decoded) {
        return null;
    }

    try {
        return JSON.parse(decoded) as T;
    } catch {
        return null;
    }
}

export async function verifyAccessToken(
    token: string,
): Promise<AuthTokenPayload | null> {
    const parts = parseJwtParts(token);
    if (!parts) {
        return null;
    }

    const header = decodeJwtSegment<{ alg?: string; typ?: string }>(
        parts.header,
    );
    if (header?.alg !== "HS256") {
        return null;
    }

    const expectedSignature = await hmacSha256(
        `${parts.header}.${parts.payload}`,
        JWT_SECRET,
    );

    if (expectedSignature !== parts.signature) {
        return null;
    }

    const payload = decodeJwtPayload<AuthTokenPayload>(token);
    if (
        payload === null ||
        typeof payload.sub !== "string" ||
        typeof payload.nome !== "string" ||
        (payload.tipo !== "ADMIN" && payload.tipo !== "VENDEDOR")
    ) {
        return null;
    }

    if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
        return null;
    }

    return payload;
}

export function getAuthUserFromPayload(
    payload: AuthTokenPayload,
): {
    id: string;
    nome: string;
    tipo: UserRole;
} {
    return {
        id: payload.sub ?? "",
        nome: payload.nome ?? "",
        tipo: payload.tipo ?? "VENDEDOR",
    };
}
