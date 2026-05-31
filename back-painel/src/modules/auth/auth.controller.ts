import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
    AuthLoginInputSchema,
    AuthLogoutInputSchema,
    AuthRefreshInputSchema,
} from "./auth.schema";
import type { AuthService } from "./auth.service";

export interface AuthController {
    login: RequestHandler;
    refresh: RequestHandler;
    me: RequestHandler;
    logout: RequestHandler;
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

            res.status(200).json(response);
        }),

        refresh: asyncHandler(async (req, res) => {
            const parsedBody = AuthRefreshInputSchema.safeParse(req.body ?? {});
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            const response = await service.refresh(
                parsedBody.data.refreshToken,
            );

            res.status(200).json(response);
        }),

        me: asyncHandler(async (req, res) => {
            if (!req.authUser) {
                res.status(401).json({
                    message: "Token ausente",
                });
                return;
            }

            res.status(200).json({
                user: {
                    id: req.authUser.sub ?? "",
                    nome: req.authUser.nome ?? "",
                    tipo: req.authUser.tipo,
                },
            });
        }),

        logout: asyncHandler(async (req, res) => {
            const parsedBody = AuthLogoutInputSchema.safeParse(req.body ?? {});
            if (!parsedBody.success) {
                sendValidationError(res, parsedBody.error.issues);
                return;
            }

            await service.logout(parsedBody.data.refreshToken);

            res.status(200).json({ ok: true });
        }),
    };
}
