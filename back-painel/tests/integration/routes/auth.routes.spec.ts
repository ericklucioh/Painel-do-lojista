import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../../helpers/create-test-app";
import {
    closeTestServer,
    createTestServer,
} from "../../helpers/create-test-server";
import {
    createAuthControllerMock,
} from "../../helpers/controllers";

describe("auth routes", () => {
    it("POST /api/auth/login returns hello world", async () => {
        const app = createTestApp({
            authController: createAuthControllerMock(),
        });
        const server = await createTestServer(app);

        try {
            const response = await request(server)
                .post("/api/auth/login")
                .send({ email: "test@example.com", password: "123456" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ hello: "world" });
        } finally {
            await closeTestServer(server);
        }
    });
});
