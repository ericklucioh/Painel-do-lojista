import { createAuthController } from "../../src/modules/auth/auth.controller";
import { createAuthRouter } from "../../src/modules/auth/auth.routes";
import { createAuthService } from "../../src/modules/auth/auth.service";
import type { AuthController } from "../../src/modules/auth/auth.controller";
import { createProductsController } from "../../src/modules/products/products.controller";
import { createProductsRouter } from "../../src/modules/products/products.routes";
import { createProductsService } from "../../src/modules/products/products.service";
import type { ProductsController } from "../../src/modules/products/products.controller";
import { createCashRegistersController } from "../../src/modules/cash-registers/cash-registers.controller";
import { createCashRegistersRouter } from "../../src/modules/cash-registers/cash-registers.routes";
import { createSalesController } from "../../src/modules/sales/sales.controller";
import { createSalesRouter } from "../../src/modules/sales/sales.routes";
import { createStockController } from "../../src/modules/stock/stock.controller";
import { createStockRouter } from "../../src/modules/stock/stock.routes";
import { createUsersController } from "../../src/modules/users/users.controller";
import { createUsersRouter } from "../../src/modules/users/users.routes";
import { createUsersService } from "../../src/modules/users/users.service";
import type { UsersController } from "../../src/modules/users/users.controller";
import { createTestClient } from "./test-client";

type TestPrismaForServices = Parameters<typeof createAuthService>[0]["prisma"] &
    Parameters<typeof createUsersService>[0]["prisma"] &
    Parameters<typeof createProductsService>[0]["prisma"];

export interface TestModules {
    prisma: ReturnType<typeof createTestClient>;
    authController: AuthController;
    usersController: UsersController;
    productsController: ProductsController;
    stockController: ReturnType<typeof createStockController>;
    salesController: ReturnType<typeof createSalesController>;
    cashRegistersController: ReturnType<typeof createCashRegistersController>;
    authRouter: ReturnType<typeof createAuthRouter>;
    usersRouter: ReturnType<typeof createUsersRouter>;
    productsRouter: ReturnType<typeof createProductsRouter>;
    cashRegistersRouter: ReturnType<typeof createCashRegistersRouter>;
    salesRouter: ReturnType<typeof createSalesRouter>;
    stockRouter: ReturnType<typeof createStockRouter>;
    close(): Promise<void>;
}

export function createTestModules(): TestModules {
    const prisma = createTestClient();
    const prismaForServices = prisma as TestPrismaForServices;

    const authController = createAuthController({
        service: createAuthService({ prisma: prismaForServices }),
    });
    const usersController = createUsersController({
        service: createUsersService({ prisma: prismaForServices }),
    });
    const productsController = createProductsController({
        service: createProductsService({ prisma: prismaForServices }),
    });
    const stockController = createStockController();
    const salesController = createSalesController();
    const cashRegistersController = createCashRegistersController();

    return {
        prisma,
        authController,
        usersController,
        productsController,
        stockController,
        salesController,
        cashRegistersController,
        authRouter: createAuthRouter({ controller: authController }),
        usersRouter: createUsersRouter({ controller: usersController }),
        productsRouter: createProductsRouter({
            controller: productsController,
        }),
        cashRegistersRouter: createCashRegistersRouter({
            controller: cashRegistersController,
        }),
        salesRouter: createSalesRouter({ controller: salesController }),
        stockRouter: createStockRouter({ controller: stockController }),
        close: () => prisma.$disconnect(),
    };
}
