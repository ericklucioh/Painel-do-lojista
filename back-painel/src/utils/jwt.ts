import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type AuthTokenRole = "ADMIN" | "VENDEDOR";

export interface AuthTokenPayload extends JwtPayload {
    sub: string;
    email: string;
    nome: string;
    tipo: AuthTokenRole;
}

export function signAccessToken(payload: AuthTokenPayload): string {
    const options: SignOptions = {
        expiresIn: env.accessTokenExpiresIn as NonNullable<
            SignOptions["expiresIn"]
        >,
    };

    return jwt.sign(payload, env.jwtSecret, {
        ...options,
    });
}

export function signRefreshToken(payload: AuthTokenPayload): string {
    const options: SignOptions = {
        expiresIn: env.refreshTokenExpiresIn as NonNullable<
            SignOptions["expiresIn"]
        >,
    };

    return jwt.sign(payload, env.refreshTokenSecret, {
        ...options,
    });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
    return jwt.verify(token, env.refreshTokenSecret) as AuthTokenPayload;
}
