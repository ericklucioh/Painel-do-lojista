import { createApp } from "../../src/app";
import type { CreateAppDependencies } from "../../src/app";
import {
    createAuthControllerMock,
    createProductsControllerMock,
    createUsersControllerMock,
} from "./controllers";

export function createTestApp(deps: CreateAppDependencies = {}) {
    return createApp({
        authController: createAuthControllerMock(),
        usersController: createUsersControllerMock(),
        productsController: createProductsControllerMock(),
        ...deps,
    });
}
