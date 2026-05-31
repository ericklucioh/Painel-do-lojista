import { createAuthController } from "../../src/modules/auth/auth.controller";
import { createAuthRouter } from "../../src/modules/auth/auth.routes";
import { createAuthService } from "../../src/modules/auth/auth.service";
import { createProductsController } from "../../src/modules/products/products.controller";
import { createProductsRouter } from "../../src/modules/products/products.routes";
import { createProductsService } from "../../src/modules/products/products.service";
import { createUsersController } from "../../src/modules/users/users.controller";
import { createUsersRouter } from "../../src/modules/users/users.routes";
import { createUsersService } from "../../src/modules/users/users.service";
import type { AuthController } from "../../src/modules/auth/auth.controller";
import type { ProductsController } from "../../src/modules/products/products.controller";
import type { UsersController } from "../../src/modules/users/users.controller";
import type { TestPrismaSeed } from "./test-prisma";
import { createTestPrisma } from "./test-prisma";

export interface TestModules {
    prisma: ReturnType<typeof createTestPrisma>;
    authController: AuthController;
    usersController: UsersController;
    productsController: ProductsController;
    authRouter: ReturnType<typeof createAuthRouter>;
    usersRouter: ReturnType<typeof createUsersRouter>;
    productsRouter: ReturnType<typeof createProductsRouter>;
}

export function createTestModules(seed: Partial<TestPrismaSeed> = {}): TestModules {
    const prisma = createTestPrisma(seed);

    const authController = createAuthController({
        service: createAuthService({ prisma }),
    });
    const usersController = createUsersController({
        service: createUsersService({ prisma }),
    });
    const productsController = createProductsController({
        service: createProductsService({ prisma }),
    });

    return {
        prisma,
        authController,
        usersController,
        productsController,
        authRouter: createAuthRouter({ controller: authController }),
        usersRouter: createUsersRouter({ controller: usersController }),
        productsRouter: createProductsRouter({ controller: productsController }),
    };
}
