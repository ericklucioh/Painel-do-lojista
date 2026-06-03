import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import {
    bearer,
    loginAsVendor,
    loginAsWrongUser,
} from "../../helpers/test-http";
import { buildExpiredAccessToken } from "../../helpers/auth-token";

let testApp: ReturnType<typeof createTestApp>;

describe("cash-registers routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("opens a cash register for the seller flow", async () => {
        const vendor = await loginAsVendor(testApp.app);

        const response = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                initialBalance: 150,
                note: "Abertura do PDV",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            cashRegister: {
                id: expect.any(String),
                openedByUserId: "user_vendor_1",
                openedByUserName: "Joao Vendedor",
                initialBalance: 150,
                currentBalance: 150,
                status: "OPEN",
                note: "Abertura do PDV",
                openedAt: expect.any(String),
                closedAt: null,
            },
        });
    });

    it("rejects admin access on vendor-only cash register routes", async () => {
        const admin = await loginAsWrongUser(testApp.app, "VENDEDOR");

        const response = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                initialBalance: 150,
                note: "Bloqueado",
            });

        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchObject({
            message: "Acesso negado",
        });
    });

    it("rejects cash register open requests without a token", async () => {
        const response = await request(testApp.app)
            .post("/api/cash-registers/open")
            .send({
                initialBalance: 150,
                note: "Sem token",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects invalid cash register payloads", async () => {
        const vendor = await loginAsVendor(testApp.app);

        const response = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                initialBalance: -1,
                note: "Saldo invalido",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects invalid and expired bearer tokens on cash register routes", async () => {
        const invalidResponse = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", "Bearer token-invalido")
            .send({
                initialBalance: 150,
                note: "Bloqueado",
            });

        expect(invalidResponse.statusCode).toBe(401);
        expect(invalidResponse.body).toMatchObject({
            message: "Token inválido",
        });

        const expiredToken = buildExpiredAccessToken({
            role: "VENDEDOR",
            sub: "user_vendor_1",
            email: "joao@painel.com",
            nome: "Joao Vendedor",
        });

        const expiredResponse = await request(testApp.app)
            .post("/api/cash-registers/open")
            .set("Authorization", `Bearer ${expiredToken}`)
            .send({
                initialBalance: 150,
                note: "Bloqueado",
            });

        expect(expiredResponse.statusCode).toBe(401);
        expect(expiredResponse.body).toMatchObject({
            message: "Token inválido",
        });
    });
});
