import jwt from "jsonwebtoken";
import { env } from "../../src/config/env";
import {
    signAccessToken,
    type AuthTokenPayload,
    type AuthTokenRole,
} from "../../src/utils/jwt";

interface BuildAccessTokenInput {
    role: AuthTokenRole;
    sub?: string;
    email?: string;
    nome?: string;
}

export function buildAccessToken({
    role,
    sub = "user-1",
    email = "user@example.com",
    nome = "Test User",
}: BuildAccessTokenInput): string {
    return signAccessToken({
        sub,
        email,
        nome,
        tipo: role,
    });
}

export function buildExpiredAccessToken({
    role,
    sub = "user-1",
    email = "user@example.com",
    nome = "Test User",
}: BuildAccessTokenInput): string {
    const payload: AuthTokenPayload = {
        sub,
        email,
        nome,
        tipo: role,
    };

    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: "-1s",
    });
}

export function buildExpiredRefreshToken({
    role,
    sub = "user-1",
    email = "user@example.com",
    nome = "Test User",
}: BuildAccessTokenInput): string {
    const payload: AuthTokenPayload = {
        sub,
        email,
        nome,
        tipo: role,
    };

    return jwt.sign(payload, env.refreshTokenSecret, {
        expiresIn: "-1s",
    });
}
