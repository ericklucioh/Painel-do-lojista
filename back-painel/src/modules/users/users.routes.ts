import { Router } from "express";
import { requireRole } from "../../middlewares/requireRole";
import type { UsersController } from "./users.controller";

export interface CreateUsersRouterDependencies {
    controller: UsersController;
}

export function createUsersRouter({
    controller,
}: CreateUsersRouterDependencies): Router {
    const router = Router();

    router.use(requireRole("ADMIN"));
    router.get("/", controller.list);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.patch("/:id/deactivate", controller.deactivate);

    return router;
}
