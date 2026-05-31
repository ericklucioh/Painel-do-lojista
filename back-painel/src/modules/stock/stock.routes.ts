import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole";
import { verifyToken } from "../../middlewares/verifyToken";
import type { StockController } from "./stock.controller";

export interface CreateStockRouterDependencies {
    controller: StockController;
}

export function createStockRouter({
    controller,
}: CreateStockRouterDependencies): Router {
    const router = Router();

    router.post("/entry", verifyToken, requireRole("ADMIN"), controller.entry);
    router.post("/exit", verifyToken, requireRole("ADMIN"), controller.exit);
    router.get(
        "/history",
        verifyToken,
        requireRole("ADMIN"),
        controller.history,
    );

    return router;
}
