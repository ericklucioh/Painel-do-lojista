import type { NextFunction, Request, RequestHandler, Response } from "express";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { createHttpError } from "../utils/httpError";

function readCookieValue(
    cookieHeader: string | undefined,
    cookieName: string,
): string | undefined {
    if (cookieHeader === undefined || cookieHeader.trim().length === 0) {
        return undefined;
    }

    const cookies = cookieHeader.split(";").map((part) => part.trim());
    const match = cookies.find((part) => part.startsWith(`${cookieName}=`));

    if (match === undefined) {
        return undefined;
    }

    return decodeURIComponent(match.slice(cookieName.length + 1));
}

function readBearerToken(
    authorizationHeader: string | undefined,
): string | undefined {
    if (authorizationHeader === undefined) {
        return undefined;
    }

    const [scheme, token] = authorizationHeader.split(" ");
    if (
        scheme !== "Bearer" ||
        token === undefined ||
        token.trim().length === 0
    ) {
        return undefined;
    }

    return token.trim();
}

export const verifyToken: RequestHandler = (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    const bearerToken = readBearerToken(req.headers.authorization);
    const cookieToken = readCookieValue(
        req.headers.cookie,
        env.accessTokenCookieName,
    );
    const token = bearerToken ?? cookieToken;

    if (token === undefined) {
        next(createHttpError("Token ausente", 401));
        return;
    }

    try {
        req.authUser = verifyAccessToken(token);
        next();
    } catch {
        next(createHttpError("Token inválido", 401));
    }
};
