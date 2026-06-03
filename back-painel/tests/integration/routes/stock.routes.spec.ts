import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import {
    bearer,
    loginAsAdmin,
    loginAsWrongUser,
} from "../../helpers/test-http";
import { buildExpiredAccessToken } from "../../helpers/auth-token";

let testApp: ReturnType<typeof createTestApp>;

describe("stock routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("records incoming and outgoing stock movements and returns history", async () => {
        const admin = await loginAsAdmin(testApp.app);
        const beforeCount = await testApp.prisma.inventoryMovement.count({
            where: {
                productId: "prod_001",
            },
        });

        const entryResponse = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 5,
                note: "Reposição",
            });

        expect(entryResponse.statusCode).toBe(201);
        expect(entryResponse.body).toMatchObject({
            stockCurrent: 23,
            movement: {
                productId: "prod_001",
                productName: "Refrigerante Cola 2L",
                type: "ENTRY",
                reason: "COMPRA",
                quantity: 5,
                balanceBefore: 18,
                balanceAfter: 23,
                note: "Reposição",
            },
        });

        const exitResponse = await request(testApp.app)
            .post("/api/stock/exit")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                type: "PERDA",
                quantity: 2,
                note: "Avaria",
            });

        expect(exitResponse.statusCode).toBe(201);
        expect(exitResponse.body).toMatchObject({
            stockCurrent: 21,
            movement: {
                productId: "prod_001",
                productName: "Refrigerante Cola 2L",
                type: "EXIT",
                reason: "PERDA",
                quantity: 2,
                balanceBefore: 23,
                balanceAfter: 21,
                note: "Avaria",
            },
        });

        const historyResponse = await request(testApp.app)
            .get("/api/stock/history")
            .set("Authorization", bearer(admin.accessToken))
            .query({ produto_id: "prod_001" });

        expect(historyResponse.statusCode).toBe(200);
        expect(historyResponse.body).toMatchObject({
            product: {
                id: "prod_001",
                ean: "7891000100015",
                name: "Refrigerante Cola 2L",
            },
            data: expect.arrayContaining([
                expect.objectContaining({
                    productId: "prod_001",
                    productName: "Refrigerante Cola 2L",
                    type: "ENTRY",
                    reason: "COMPRA",
                    quantity: 5,
                    balanceBefore: 18,
                    balanceAfter: 23,
                    note: "Reposição",
                }),
                expect.objectContaining({
                    productId: "prod_001",
                    productName: "Refrigerante Cola 2L",
                    type: "EXIT",
                    reason: "PERDA",
                    quantity: 2,
                    balanceBefore: 23,
                    balanceAfter: 21,
                    note: "Avaria",
                }),
            ]),
        });

        const persistedMovements =
            await testApp.prisma.inventoryMovement.findMany({
                where: { productId: "prod_001" },
            });
        expect(persistedMovements.length).toBe(beforeCount + 2);
    });

    it("allows stock to go negative on exit flows", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/exit")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_004",
                type: "PERDA",
                quantity: 10,
                note: "Quebra",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            stockCurrent: -6,
            movement: {
                productId: "prod_004",
                productName: "Leite Integral 1L",
                type: "EXIT",
                reason: "PERDA",
                quantity: 10,
                balanceBefore: 4,
                balanceAfter: -6,
                note: "Quebra",
            },
        });
    });

    it("records a return entry with a different reason", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_002",
                type: "DEVOLUCAO",
                quantity: 3,
                note: "Troca do fornecedor",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            stockCurrent: 10,
            movement: {
                productId: "prod_002",
                productName: "Arroz 5kg",
                type: "ENTRY",
                reason: "Troca do fornecedor",
                quantity: 3,
                balanceBefore: 7,
                balanceAfter: 10,
                note: "Troca do fornecedor",
            },
        });
    });

    it("records an exit with damaged goods", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/exit")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_004",
                type: "DANIFICADO",
                quantity: 2,
                note: "Baixa por dano",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toMatchObject({
            stockCurrent: 2,
            movement: {
                productId: "prod_004",
                productName: "Leite Integral 1L",
                type: "EXIT",
                reason: "Baixa por dano",
                quantity: 2,
                balanceBefore: 4,
                balanceAfter: 2,
                note: "Baixa por dano",
            },
        });
    });

    it("rejects vendor access on admin-only stock routes", async () => {
        const vendor = await loginAsWrongUser(testApp.app, "ADMIN");

        const entryResponse = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 1,
                note: "Bloqueado",
            });

        expect(entryResponse.statusCode).toBe(403);
        expect(entryResponse.body).toMatchObject({
            message: "Acesso negado",
        });

        const historyResponse = await request(testApp.app)
            .get("/api/stock/history")
            .set("Authorization", bearer(vendor.accessToken))
            .query({ produto_id: "prod_001" });

        expect(historyResponse.statusCode).toBe(403);
        expect(historyResponse.body).toMatchObject({
            message: "Acesso negado",
        });
    });

    it("rejects stock entry requests without a token", async () => {
        const response = await request(testApp.app)
            .post("/api/stock/entry")
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 1,
                note: "Sem token",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects invalid and expired bearer tokens on stock routes", async () => {
        const invalidResponse = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", "Bearer token-invalido")
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 1,
                note: "Bloqueado",
            });

        expect(invalidResponse.statusCode).toBe(401);
        expect(invalidResponse.body).toMatchObject({
            message: "Token inválido",
        });

        const expiredToken = buildExpiredAccessToken({
            role: "ADMIN",
            sub: "user_admin_1",
            email: "admin@painel.com",
            nome: "Admin do Sistema",
        });

        const expiredResponse = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", `Bearer ${expiredToken}`)
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 1,
                note: "Bloqueado",
            });

        expect(expiredResponse.statusCode).toBe(401);
        expect(expiredResponse.body).toMatchObject({
            message: "Token inválido",
        });
    });

    it("rejects invalid stock entry payloads", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                type: "COMPRA",
                quantity: 0,
                note: "Quantidade invalida",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects invalid stock entry types", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/entry")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                type: "AJUSTE",
                quantity: 1,
                note: "Tipo invalido",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects invalid stock exit payloads", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/stock/exit")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                productId: "prod_001",
                type: "PERDA",
                quantity: 0,
                note: "Quantidade invalida",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects malformed history queries", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/stock/history")
            .set("Authorization", bearer(admin.accessToken))
            .query({ produto_id: "" });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects history for missing products", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/stock/history")
            .set("Authorization", bearer(admin.accessToken))
            .query({ produto_id: "prod_missing" });

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            message: "Product not found",
        });
    });
});
