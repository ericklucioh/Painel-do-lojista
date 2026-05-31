import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";
import { buildAccessToken } from "../../helpers/auth-token";
import { StockMovementResponseSchema, StockHistoryResponseSchema } from "../../../src/modules/stock/stock.schema";

let modules: ReturnType<typeof createTestModules>;

describe("stock routes", () => {
    beforeAll(() => {
        modules = createTestModules();
    });

    afterAll(async () => {
        await modules.close();
    });

    it("records stock movements and returns history with the official controller contract", async () => {
        const headers = {
            authorization: `Bearer ${buildAccessToken({
                role: "ADMIN",
                sub: "user_admin_1",
                nome: "Admin do Sistema",
            })}`,
        };

        const entryResponse = await invokeRouterRoute(
            modules.stockRouter,
            "POST",
            "/entry",
            {
                headers,
                body: {
                    productId: "prod_001",
                    quantity: 5,
                    reason: "COMPRA",
                    note: "Reposição",
                },
            },
        );

        expect(entryResponse.statusCode).toBe(201);
        expect(StockMovementResponseSchema.parse(entryResponse.body)).toMatchObject({
            movement: {
                type: "ENTRY",
                reason: "Reposição",
                quantity: 5,
                balanceAfter: 5,
            },
        });

        const exitResponse = await invokeRouterRoute(
            modules.stockRouter,
            "POST",
            "/exit",
            {
                headers,
                body: {
                    productId: "prod_001",
                    quantity: 2,
                    reason: "PERDA",
                    note: "Avaria",
                },
            },
        );

        expect(exitResponse.statusCode).toBe(201);
        expect(StockMovementResponseSchema.parse(exitResponse.body)).toMatchObject({
            movement: {
                type: "EXIT",
                reason: "Avaria",
                quantity: 2,
                balanceAfter: -2,
            },
        });

        const historyResponse = await invokeRouterRoute(
            modules.stockRouter,
            "GET",
            "/history",
            {
                headers,
                query: {
                    produto_id: "prod_001",
                },
            },
        );

        expect(historyResponse.statusCode).toBe(200);
        expect(
            StockHistoryResponseSchema.parse(historyResponse.body),
        ).toMatchObject({
            product: {
                id: "prod_001",
                ean: "0000000000000",
                name: "Produto de teste",
            },
            data: [],
        });
    });
});
