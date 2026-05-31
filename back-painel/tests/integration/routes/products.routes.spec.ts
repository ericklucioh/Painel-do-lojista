import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";
import { buildAccessToken } from "../../helpers/auth-token";
import { resetTestDatabase } from "../../helpers/test-database";

let modules: ReturnType<typeof createTestModules>;

describe("products routes", () => {
    beforeAll(() => {
        resetTestDatabase();
        modules = createTestModules();
    });

    afterAll(async () => {
        await modules.close();
    });

    it("runs the real products flow with sqlite", async () => {
        const adminHeaders = {
            authorization: `Bearer ${buildAccessToken({ role: "ADMIN" })}`,
        };
        const vendorHeaders = {
            authorization: `Bearer ${buildAccessToken({ role: "VENDEDOR" })}`,
        };

        const listResponse = await invokeRouterRoute(
            modules.productsRouter,
            "GET",
            "/",
            {
                headers: adminHeaders,
                query: {
                    page: 1,
                    search: "cola",
                },
            },
        );

        expect(listResponse.statusCode).toBe(200);
        expect(listResponse.body).toMatchObject({
            search: "cola",
            totalItems: expect.any(Number),
            data: expect.arrayContaining([
                expect.objectContaining({
                    id: "prod_001",
                    stockCurrent: 18,
                }),
            ]),
        });

        const byEanResponse = await invokeRouterRoute(
            modules.productsRouter,
            "GET",
            "/by-ean/7891000100022",
            { headers: vendorHeaders },
        );

        expect(byEanResponse.statusCode).toBe(200);
        expect(byEanResponse.body).toMatchObject({
            id: "prod_002",
            ean: "7891000100022",
            stockCurrent: 7,
        });

        const createResponse = await invokeRouterRoute(
            modules.productsRouter,
            "POST",
            "/",
            {
                headers: adminHeaders,
                body: {
                    ean: "7891000100099",
                    name: "Produto Novo",
                    price: 14.5,
                    minStock: 3,
                    maxStock: 20,
                },
            },
        );

        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body).toMatchObject({
            product: {
                ean: "7891000100099",
                name: "Produto Novo",
                deletedAt: null,
            },
        });

        const updateResponse = await invokeRouterRoute(
            modules.productsRouter,
            "PUT",
            "/prod_001",
            {
                headers: adminHeaders,
                body: {
                    name: "Refrigerante Cola 2L Atualizado",
                },
            },
        );

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body).toMatchObject({
            product: {
                id: "prod_001",
                name: "Refrigerante Cola 2L Atualizado",
            },
        });

        const deactivateResponse = await invokeRouterRoute(
            modules.productsRouter,
            "PATCH",
            "/prod_004/deactivate",
            { headers: adminHeaders },
        );

        expect(deactivateResponse.statusCode).toBe(200);
        expect(deactivateResponse.body).toMatchObject({
            success: true,
            product: {
                id: "prod_004",
                deletedAt: expect.any(String),
            },
        });
    });
});
