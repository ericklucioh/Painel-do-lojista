import { createApp } from "../../src/app";
import type { Express } from "express";
import { createTestModules } from "./test-modules";
import type { TestPrismaSeed } from "./test-prisma";

export function createTestApp(seed: Partial<TestPrismaSeed> = {}): Express {
    const modules = createTestModules(seed);

    return createApp({
        authController: modules.authController,
        usersController: modules.usersController,
        productsController: modules.productsController,
    });
}
