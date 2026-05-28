import { Router } from "express";
import type { AuthController } from "./auth.controller";

export interface CreateAuthRouterDependencies {
    controller: AuthController;
}

export function createAuthRouter({
    controller,
}: CreateAuthRouterDependencies): Router {
    const router = Router();

    router.post("/login", controller.login);
    router.post("/refresh", controller.refresh);

    return router;
}
