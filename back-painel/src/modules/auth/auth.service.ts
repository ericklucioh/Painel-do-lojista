import { compare } from "bcryptjs";
import {
    authLoginMock,
    authUsersMock,
    type AuthMockUser,
} from "../../mocks/auth.mock";
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

export interface AuthService {
    login(input: AuthLoginInput): Promise<AuthLoginResponse>;
    refresh(refreshToken: string): Promise<AuthRefreshResponse>;
}

export interface CreateAuthServiceOptions {
    users?: ReadonlyArray<AuthMockUser>;
}

function toAuthUser(user: AuthMockUser): AuthUser {
    return {
        id: user.id,
        nome: user.nome,
        tipo: user.tipo,
    };
}

function createTokenPayload(user: AuthMockUser): AuthTokenPayload {
    return {
        sub: user.id,
        email: user.email,
        nome: user.nome,
        tipo: user.tipo,
    };
}

function cloneAuthLoginMock(
    user: AuthUser,
    refreshToken: string,
    accessToken: string,
): AuthLoginResponse {
    return {
        ...authLoginMock,
        accessToken,
        refreshToken,
        user,
    };
}

export function createAuthService({
    users = authUsersMock,
}: CreateAuthServiceOptions = {}): AuthService {
    const refreshTokenStore = new Map<string, string>();

    return {
        async login(input) {
            const account = users.find(
                (user) => user.email === input.email && user.isActive,
            );

            if (account === undefined) {
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

            return cloneAuthLoginMock(
                toAuthUser(account),
                refreshToken,
                accessToken,
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

            const account = users.find(
                (user) => user.id === decoded.sub && user.isActive,
            );

            if (account === undefined) {
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
