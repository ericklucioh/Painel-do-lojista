import type { RequestHandler } from "express";
import { createHttpError } from "../utils/httpError";
import type { AuthTokenRole } from "../utils/jwt";

export function requireRole(role: AuthTokenRole): RequestHandler {
    return (req, _res, next) => {
        const user = req.authUser;

        if (user === undefined) {
            next(createHttpError("Token ausente", 401));
            return;
        }

        if (user.tipo !== role) {
            next(createHttpError("Acesso negado", 403));
            return;
        }

        next();
    };
}
