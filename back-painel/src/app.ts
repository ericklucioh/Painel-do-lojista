import express, { type Express } from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { verifyToken } from "./middlewares/verifyToken";
import {
    createBackendRoutes,
    type BackendDependencies,
} from "./bootstrap/backend";

export function createApp(dependencies: BackendDependencies = {}): Express {
    const app = express();
    const allowedOrigins = new Set(env.corsOrigins);

    app.use(
        cors({
            origin(origin, callback) {
                if (origin === undefined) {
                    callback(null, true);
                    return;
                }

                callback(null, allowedOrigins.has(origin));
            },
            credentials: true,
        }),
    );
    app.use(express.json());

    const backendRoutes = createBackendRoutes(dependencies);

    app.get("/health", (_req, res) => {
        res.status(200).json({ ok: true });
    });

    app.use("/api/auth", backendRoutes.authRouter);
    app.use(verifyToken);
    app.use("/api/users", backendRoutes.usersRouter);
    app.use("/api/products", backendRoutes.productsRouter);
    app.use("/api/cash-registers", backendRoutes.cashRegistersRouter);
    app.use("/api/stock", backendRoutes.stockRouter);
    app.use("/api/sales", backendRoutes.salesRouter);

    app.use(errorHandler);

    return app;
}
