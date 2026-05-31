import { compare } from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    type AuthTokenPayload,
} from "../../utils/jwt";
import { createHttpError } from "../../utils/httpError";
import type {
    AuthLoginInput,
    AuthLoginResponse,
    AuthRefreshResponse,
    AuthUser,
} from "./auth.schema";

type AuthRole = "ADMIN" | "VENDEDOR";

type AuthUserRecord = {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: AuthRole;
    deactivatedAt: Date | null;
    deletedAt: Date | null;
};

export interface AuthService {
    login(input: AuthLoginInput): Promise<AuthLoginResponse>;
    refresh(refreshToken: string): Promise<AuthRefreshResponse>;
}

export interface CreateAuthServiceDependencies {
    prisma: Pick<PrismaClient, "user">;
}

function isActive(user: AuthUserRecord): boolean {
    return user.deactivatedAt === null && user.deletedAt === null;
}

function toAuthUser(user: AuthUserRecord): AuthUser {
    return {
        id: user.id,
        nome: user.fullName,
        tipo: user.role,
    };
}

function createTokenPayload(user: AuthUserRecord): AuthTokenPayload {
    return {
        sub: user.id,
        email: user.email,
        nome: user.fullName,
        tipo: user.role,
    };
}

function createAuthResponse(
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
): AuthLoginResponse {
    return {
        accessToken,
        refreshToken,
        expiresIn: 900,
        user,
    };
}

export function createAuthService({
    prisma,
}: CreateAuthServiceDependencies): AuthService {
    const refreshTokenStore = new Map<string, string>();

    return {
        async login(input) {
            const account = await prisma.user.findUnique({
                where: {
                    email: input.email,
                },
            });

            if (account === null || !isActive(account)) {
                throw createHttpError("Credenciais inválidas", 401);
            }

            const passwordMatches = await compare(
                input.password,
                account.passwordHash,
            );
            if (!passwordMatches) {
                throw createHttpError("Credenciais inválidas", 401);
            }

            const payload = createTokenPayload(account);
            const accessToken = signAccessToken(payload);
            const refreshToken = signRefreshToken(payload);

            refreshTokenStore.set(refreshToken, account.id);

            return createAuthResponse(
                toAuthUser(account),
                accessToken,
                refreshToken,
            );
        },

        async refresh(refreshToken) {
            if (refreshToken.trim().length === 0) {
                throw createHttpError("Refresh token ausente", 401);
            }

            if (!refreshTokenStore.has(refreshToken)) {
                throw createHttpError("Refresh token inválido", 401);
            }

            let decoded: AuthTokenPayload;
            try {
                decoded = verifyRefreshToken(refreshToken);
            } catch {
                refreshTokenStore.delete(refreshToken);
                throw createHttpError("Refresh token inválido", 401);
            }

            const account = await prisma.user.findUnique({
                where: {
                    id: decoded.sub,
                },
            });

            if (account === null || !isActive(account)) {
                refreshTokenStore.delete(refreshToken);
                throw createHttpError("Refresh token inválido", 401);
            }

            refreshTokenStore.delete(refreshToken);

            const payload = createTokenPayload(account);
            const nextAccessToken = signAccessToken(payload);
            const nextRefreshToken = signRefreshToken(payload);

            refreshTokenStore.set(nextRefreshToken, account.id);

            return {
                accessToken: nextAccessToken,
                refreshToken: nextRefreshToken,
                expiresIn: 900,
            };
        },
    };
}
