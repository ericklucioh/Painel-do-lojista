import { vi } from "vitest";
import type { AuthController } from "../../src/modules/auth/auth.controller";
import type { ProductsController } from "../../src/modules/products/products.controller";
import type { UsersController } from "../../src/modules/users/users.controller";

export function createAuthControllerMock(): AuthController {
    return {
        login: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        refresh: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
    };
}

export function createUsersControllerMock(): UsersController {
    return {
        list: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        create: vi.fn((_req, res) => {
            res.status(201).json({ hello: "world" });
        }),
        update: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        deactivate: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
    };
}

export function createProductsControllerMock(): ProductsController {
    return {
        list: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        getByEan: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        create: vi.fn((_req, res) => {
            res.status(201).json({ hello: "world" });
        }),
        update: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
        deactivate: vi.fn((_req, res) => {
            res.status(200).json({ hello: "world" });
        }),
    };
}
