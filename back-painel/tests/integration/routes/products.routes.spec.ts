import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../../helpers/create-test-app";
import {
    closeTestServer,
    createTestServer,
} from "../../helpers/create-test-server";
import {
    createUsersControllerMock,
    createProductsControllerMock,
} from "../../helpers/controllers";
import { buildAccessToken } from "../../helpers/auth-token";

describe("products routes", () => {
    it("GET /api/products returns hello world for authenticated user", async () => {
        const app = createTestApp({
            usersController: createUsersControllerMock(),
            productsController: createProductsControllerMock(),
        });
        const token = buildAccessToken({ role: "ADMIN" });
        const server = await createTestServer(app);

        try {
            const response = await request(server)
                .get("/api/products")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ hello: "world" });
        } finally {
            await closeTestServer(server);
        }
    });
});
