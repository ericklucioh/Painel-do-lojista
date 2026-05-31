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

describe("users routes", () => {
    it("GET /api/users returns hello world for ADMIN", async () => {
        const app = createTestApp({
            usersController: createUsersControllerMock(),
            productsController: createProductsControllerMock(),
        });
        const token = buildAccessToken({ role: "ADMIN" });
        const server = await createTestServer(app);

        try {
            const response = await request(server)
                .get("/api/users")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ hello: "world" });
        } finally {
            await closeTestServer(server);
        }
    });
});
