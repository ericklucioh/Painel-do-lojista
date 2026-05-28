import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole";
import { verifyToken } from "../../middlewares/verifyToken";
import type { ProductsController } from "./products.controller";

export interface CreateProductsRouterDependencies {
    controller: ProductsController;
}

export function createProductsRouter({
    controller,
}: CreateProductsRouterDependencies): Router {
    const router = Router();

    router.get("/", verifyToken, controller.list);
    router.get(
        "/by-ean/:ean",
        verifyToken,
        requireRole("VENDEDOR"),
        controller.getByEan,
    );
    router.post("/", verifyToken, requireRole("ADMIN"), controller.create);
    router.put("/:id", verifyToken, requireRole("ADMIN"), controller.update);
    router.patch(
        "/:id/deactivate",
        verifyToken,
        requireRole("ADMIN"),
        controller.deactivate,
    );

    return router;
}
