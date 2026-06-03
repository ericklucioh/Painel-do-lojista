import "server-only";

import type { AuthUser } from "@/types/api";
import {
    fetchCurrentUserOnBackend,
    refreshOnBackend,
} from "@/lib/auth-backend";

export type AuthSession = AuthUser;

export type AuthSessionTokens = {
    accessToken: string;
    refreshToken: string;
};

export type ResolvedAuthSession = {
    session: AuthSession;
    cookies?: AuthSessionTokens;
} | null;

async function resolveSessionWithAccessToken(
    accessToken: string,
): Promise<AuthSession | null> {
    const currentUser = await fetchCurrentUserOnBackend(accessToken);

    if (!currentUser.ok || !currentUser.data) {
        return null;
    }

    return currentUser.data;
}

async function resolveSessionWithRefreshToken(
    refreshToken: string,
): Promise<ResolvedAuthSession> {
    const refreshed = await refreshOnBackend(refreshToken);

    if (!refreshed.ok || !refreshed.data) {
        return null;
    }

    return {
        session: refreshed.data.user,
        cookies: {
            accessToken: refreshed.data.accessToken,
            refreshToken: refreshed.data.refreshToken,
        },
    };
}

export async function resolveAuthSession(
    accessToken: string | null,
    refreshToken: string | null,
): Promise<ResolvedAuthSession> {
    if (accessToken) {
        const session = await resolveSessionWithAccessToken(accessToken);
        if (session) {
            return {
                session,
            };
        }
    }

    if (!refreshToken) {
        return null;
    }

    return resolveSessionWithRefreshToken(refreshToken);
}
