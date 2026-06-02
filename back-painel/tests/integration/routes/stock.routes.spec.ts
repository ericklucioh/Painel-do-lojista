import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

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
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

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
        expect(persistedMovements.length).toBeGreaterThanOrEqual(10);
    });

    it("allows stock to go negative on exit flows", async () => {
        const admin = await loginAs(testApp.app, "admin@painel.com", "123456");

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
});
