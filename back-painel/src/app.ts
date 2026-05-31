import express, { type Express } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { getPrisma } from "./config/prisma";
import { createAuthController } from "./modules/auth/auth.controller";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { createAuthService } from "./modules/auth/auth.service";
import { createUsersController } from "./modules/users/users.controller";
import { createUsersRouter } from "./modules/users/users.routes";
import { createUsersService } from "./modules/users/users.service";
import { createProductsRouter } from "./modules/products/products.routes";
import { createProductsService } from "./modules/products/products.service";
import { createProductsController } from "./modules/products/products.controller";
import { createStockController } from "./modules/stock/stock.controller";
import { createStockRouter } from "./modules/stock/stock.routes";
import { createSalesController } from "./modules/sales/sales.controller";
import { createSalesRouter } from "./modules/sales/sales.routes";
import { createCashRegistersController } from "./modules/cash-registers/cash-registers.controller";
import { createCashRegistersRouter } from "./modules/cash-registers/cash-registers.routes";
import { verifyToken } from "./middlewares/verifyToken";
import type { AuthController } from "./modules/auth/auth.controller";
import type { ProductsController } from "./modules/products/products.controller";
import type { UsersController } from "./modules/users/users.controller";
import type { StockController } from "./modules/stock/stock.controller";
import type { SalesController } from "./modules/sales/sales.controller";
import type { CashRegistersController } from "./modules/cash-registers/cash-registers.controller";

export interface CreateAppDependencies {
    authController?: AuthController;
    usersController?: UsersController;
    productsController?: ProductsController;
    stockController?: StockController;
    salesController?: SalesController;
    cashRegistersController?: CashRegistersController;
}

export function createApp({
    authController,
    usersController,
    productsController,
    stockController,
    salesController,
    cashRegistersController,
}: CreateAppDependencies = {}): Express {
    const app = express();

    app.use(
        cors({
            origin: true,
            credentials: true,
        }),
    );
    app.use(express.json());

    const resolvedAuthController =
        authController ??
        createAuthController({
            service: createAuthService({
                prisma: getPrisma(),
            }),
        });
    const resolvedProductsController =
        productsController ??
        createProductsController({
            service: createProductsService({
                prisma: getPrisma(),
            }),
        });
    const resolvedUsersController =
        usersController ??
        createUsersController({
            service: createUsersService({
                prisma: getPrisma(),
            }),
        });
    const resolvedStockController =
        stockController ?? createStockController();
    const resolvedSalesController =
        salesController ?? createSalesController();
    const resolvedCashRegistersController =
        cashRegistersController ?? createCashRegistersController();

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });

    app.use("/api/auth", createAuthRouter({ controller: resolvedAuthController }));
    app.use(verifyToken);
    app.use("/api/users", createUsersRouter({ controller: resolvedUsersController }));
    app.use(
        "/api/products",
        createProductsRouter({ controller: resolvedProductsController }),
    );
    app.use(
        "/api/cash-registers",
        createCashRegistersRouter({ controller: resolvedCashRegistersController }),
    );
    app.use("/api/stock", createStockRouter({ controller: resolvedStockController }));
    app.use("/api/sales", createSalesRouter({ controller: resolvedSalesController }));

    app.use(errorHandler);

    return app;
}
