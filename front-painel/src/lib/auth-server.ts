import "server-only";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth-config";
import { getAuthUserFromPayload, verifyAccessToken } from "@/lib/auth-jwt";

export type AuthSession = {
    id: string;
    nome: string;
    tipo: "ADMIN" | "VENDEDOR";
};

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
        return null;
    }

    const payload = await verifyAccessToken(accessToken);
    if (!payload) {
        return null;
    }

    return getAuthUserFromPayload(payload);
}
