import "server-only";

import { cookies } from "next/headers";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-config";
import { resolveAuthSession, type AuthSession } from "@/lib/auth-session";

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    const resolvedSession = await resolveAuthSession(
        accessToken ?? null,
        refreshToken ?? null,
    );

    return resolvedSession?.session ?? null;
}
