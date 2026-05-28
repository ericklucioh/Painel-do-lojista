import type { RequestHandler } from "express";
import { env } from "../../config/env";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthLoginInputSchema, AuthRefreshInputSchema } from "./auth.schema";
import type { AuthService } from "./auth.service";

export interface AuthController {
    login: RequestHandler;
    refresh: RequestHandler;
}

export interface CreateAuthControllerDependencies {
    service: AuthService;
}

function sendValidationError(
    res: Parameters<RequestHandler>[1],
    issues: unknown,
): void {
    res.status(400).json({
        message: "Validation error",
        issues,
    });
}

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

export function createAuthController({
    service,
}: CreateAuthControllerDependencies): AuthController {
    return {
        login: asyncHandler(async (req, res) => {
            const parsedBody = AuthLoginInputSchema.safeParse(req.body);
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.login(parsedBody.data);

            res.cookie(env.accessTokenCookieName, response.accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: env.nodeEnv === "production",
                maxAge: 15 * 60 * 1000,
            });
            res.cookie(env.authCookieName, response.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: env.nodeEnv === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json(response);
        }),

        refresh: asyncHandler(async (req, res) => {
            const parsedBody = AuthRefreshInputSchema.safeParse(req.body ?? {});
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const refreshTokenFromBody = parsedBody.data.refreshToken;
            const refreshTokenFromCookie = readCookieValue(
                req.headers.cookie,
                env.authCookieName,
            );
            const refreshToken = refreshTokenFromBody ?? refreshTokenFromCookie;

            if (refreshToken === undefined) {
                res.status(401).json({
                    message: "Refresh token ausente",
                });
                return;
            }

            const response = await service.refresh(refreshToken);

            res.cookie(env.accessTokenCookieName, response.accessToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: env.nodeEnv === "production",
                maxAge: 15 * 60 * 1000,
            });
            res.cookie(env.authCookieName, response.refreshToken, {
                httpOnly: true,
                sameSite: "lax",
                secure: env.nodeEnv === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json(response);
        }),
    };
}
