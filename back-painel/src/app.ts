import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { createAuthController } from "./modules/auth/auth.controller";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { createAuthService } from "./modules/auth/auth.service";
import { createUsersController } from "./modules/users/users.controller";
import { createUsersRouter } from "./modules/users/users.routes";
import { createUsersService } from "./modules/users/users.service";
import { createProductsRouter } from "./modules/products/products.routes";
import { createProductsService } from "./modules/products/products.service";
import { createProductsController } from "./modules/products/products.controller";
import { verifyToken } from "./middlewares/verifyToken";

export function createApp(): Express {
    const app = express();

    app.use(
        cors({
            origin: true,
            credentials: true,
        }),
    );
    app.use(express.json());

    const authService = createAuthService();
    const authController = createAuthController({
        service: authService,
    });
    const productsService = createProductsService();
    const productsController = createProductsController({
        service: productsService,
    });
    const usersService = createUsersService();
    const usersController = createUsersController({
        service: usersService,
    });

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });

    app.use("/api/auth", createAuthRouter({ controller: authController }));
    app.use(verifyToken);
    app.use("/api/users", createUsersRouter({ controller: usersController }));
    app.use(
        "/api/products",
        createProductsRouter({ controller: productsController }),
    );

    app.use(errorHandler);

    return app;
}
