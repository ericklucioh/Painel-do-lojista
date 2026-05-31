import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole";
import { verifyToken } from "../../middlewares/verifyToken";
import type { CashRegistersController } from "./cash-registers.controller";

export interface CreateCashRegistersRouterDependencies {
    controller: CashRegistersController;
}

export function createCashRegistersRouter({
    controller,
}: CreateCashRegistersRouterDependencies): Router {
    const router = Router();

    router.post("/open", verifyToken, requireRole("VENDEDOR"), controller.open);

    return router;
}
