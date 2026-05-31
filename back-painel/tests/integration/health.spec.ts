import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/create-test-app";
import {
    closeTestServer,
    createTestServer,
} from "../helpers/create-test-server";

describe("health route", () => {
    it("GET /health returns ok", async () => {
        const app = createTestApp();
        const server = await createTestServer(app);

        try {
            const response = await request(server).get("/health");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ ok: true });
        } finally {
            await closeTestServer(server);
        }
    });
});
