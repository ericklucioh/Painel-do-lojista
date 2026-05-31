import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole";
import { verifyToken } from "../../middlewares/verifyToken";
import type { SalesController } from "./sales.controller";

export interface CreateSalesRouterDependencies {
    controller: SalesController;
}

export function createSalesRouter({
    controller,
}: CreateSalesRouterDependencies): Router {
    const router = Router();

    router.post("/", verifyToken, requireRole("VENDEDOR"), controller.create);
    router.post(
        "/print-receipt",
        verifyToken,
        requireRole("VENDEDOR"),
        controller.printReceipt,
    );
    router.delete(
        "/:id",
        verifyToken,
        requireRole("VENDEDOR"),
        controller.cancel,
    );

    return router;
}
