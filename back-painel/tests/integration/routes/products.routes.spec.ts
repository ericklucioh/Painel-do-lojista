import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import {
    bearer,
    loginAsAdmin,
    loginAsVendor,
    loginAsWrongUser,
} from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("products routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("covers the happy path product flows", async () => {
        const admin = await loginAsAdmin(testApp.app);
        const vendor = await loginAsVendor(testApp.app);

        const listResponse = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1, search: "cola" })
            .expect(200);

        expect(listResponse.body).toMatchObject({
            page: 1,
            pageSize: 10,
            search: "cola",
            totalItems: 1,
            totalPages: 1,
            data: [
                expect.objectContaining({
                    id: "prod_001",
                    ean: "7891000100015",
                    name: "Refrigerante Cola 2L",
                    price: 12.9,
                    stockCurrent: 18,
                    isCritical: false,
                    isActive: true,
                }),
            ],
        });

        const byEanResponse = await request(testApp.app)
            .get("/api/products/by-ean/7891000100022")
            .set("Authorization", bearer(vendor.accessToken))
            .expect(200);

        expect(byEanResponse.body).toMatchObject({
            id: "prod_002",
            ean: "7891000100022",
            name: "Arroz 5kg",
            price: 29.9,
            stockCurrent: 7,
            isActive: true,
        });

        const createResponse = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100099",
                name: "Produto Novo",
                price: 14.5,
                minStock: 3,
                maxStock: 20,
            })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            product: {
                ean: "7891000100099",
                name: "Produto Novo",
                price: 14.5,
                minStock: 3,
                maxStock: 20,
                deletedAt: null,
                isActive: true,
            },
        });

        const createdProductId = createResponse.body.product.id as string;

        const updateResponse = await request(testApp.app)
            .put(`/api/products/${createdProductId}`)
            .set("Authorization", bearer(admin.accessToken))
            .send({
                name: "Produto Novo Atualizado",
                price: 19.5,
            })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            product: {
                id: createdProductId,
                name: "Produto Novo Atualizado",
                price: 19.5,
            },
        });

        const deactivateResponse = await request(testApp.app)
            .patch(`/api/products/${createdProductId}/deactivate`)
            .set("Authorization", bearer(admin.accessToken))
            .expect(200);

        expect(deactivateResponse.body).toMatchObject({
            success: true,
            product: {
                id: createdProductId,
                deletedAt: expect.any(String),
            },
        });

        const persistedProduct = await testApp.prisma.product.findUnique({
            where: { id: createdProductId },
        });
        expect(persistedProduct).not.toBeNull();
        expect(persistedProduct?.deletedAt).not.toBeNull();
        expect(persistedProduct?.deactivatedAt).not.toBeNull();

        const inactiveLookup = await request(testApp.app)
            .get("/api/products/by-ean/7891000100099")
            .set("Authorization", bearer(vendor.accessToken));

        expect(inactiveLookup.statusCode).toBe(404);
        expect(inactiveLookup.body).toMatchObject({
            message: "Produto não disponível para venda",
        });

        const listAfterDeactivate = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1, search: "Produto Novo" })
            .expect(200);

        expect(listAfterDeactivate.body.totalItems).toBe(0);
    });

    it("lists all active products without a search filter", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 1 })
            .expect(200);

        expect(response.body).toMatchObject({
            page: 1,
            pageSize: 10,
            totalItems: 4,
            totalPages: 1,
            data: expect.arrayContaining([
                expect.objectContaining({
                    id: "prod_001",
                    ean: "7891000100015",
                    name: "Refrigerante Cola 2L",
                    price: 12.9,
                    stockCurrent: 18,
                    minStock: 10,
                    maxStock: 80,
                    isCritical: false,
                    isActive: true,
                }),
                expect.objectContaining({
                    id: "prod_002",
                    ean: "7891000100022",
                    name: "Arroz 5kg",
                    price: 29.9,
                    stockCurrent: 7,
                    minStock: 12,
                    maxStock: 100,
                    isCritical: true,
                    isActive: true,
                }),
            ]),
        });
    });

    it("creates a critical product", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100099",
                name: "Sabao em Po 1kg",
                price: 21.9,
                minStock: 5,
                maxStock: 25,
            })
            .expect(201);

        expect(response.body).toMatchObject({
            product: {
                ean: "7891000100099",
                name: "Sabao em Po 1kg",
                price: 21.9,
                stockCurrent: 0,
                minStock: 5,
                maxStock: 25,
                isCritical: true,
                isActive: true,
                deletedAt: null,
            },
        });
    });

    it("updates only the product price", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .put("/api/products/prod_003")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                price: 9.75,
            })
            .expect(200);

        expect(response.body).toMatchObject({
            product: {
                id: "prod_003",
                ean: "7891000100039",
                name: "Feijao Carioca 1kg",
                price: 9.75,
                stockCurrent: 24,
                minStock: 8,
                maxStock: 60,
                isCritical: false,
                isActive: true,
                deletedAt: null,
            },
        });
    });

    it("rejects vendor access on admin-only product routes", async () => {
        const vendor = await loginAsWrongUser(testApp.app, "ADMIN");

        const createResponse = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                ean: "7891000100199",
                name: "Produto Bloqueado",
                price: 10.0,
                minStock: 1,
                maxStock: 10,
            });

        expect(createResponse.statusCode).toBe(403);
        expect(createResponse.body).toMatchObject({
            message: "Acesso negado",
        });

        const updateResponse = await request(testApp.app)
            .put("/api/products/prod_001")
            .set("Authorization", bearer(vendor.accessToken))
            .send({
                price: 15.0,
            });

        expect(updateResponse.statusCode).toBe(403);
        expect(updateResponse.body).toMatchObject({
            message: "Acesso negado",
        });
    });

    it("rejects admin access on vendor-only product lookup", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/products/by-ean/7891000100022")
            .set("Authorization", bearer(admin.accessToken));

        expect(response.statusCode).toBe(403);
        expect(response.body).toMatchObject({
            message: "Acesso negado",
        });
    });

    it("rejects invalid product list queries", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .query({ page: 0 });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects product list requests without a token", async () => {
        const response = await request(testApp.app)
            .get("/api/products")
            .query({ page: 1 });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects duplicate EANs on product creation", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100015",
                name: "Duplicado",
                price: 11.0,
                minStock: 1,
                maxStock: 10,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Este EAN já existe",
        });
    });

    it("rejects invalid product creation payloads", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/products")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                ean: "7891000100999",
                name: "Produto Invalido",
                price: 0,
                minStock: 10,
                maxStock: 5,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects updates for missing products", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .put("/api/products/prod_missing")
            .set("Authorization", bearer(admin.accessToken))
            .send({
                price: 15.0,
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            message: "Product not found",
        });
    });

    it("rejects malformed EAN lookup params", async () => {
        const vendor = await loginAsVendor(testApp.app);

        const response = await request(testApp.app)
            .get("/api/products/by-ean/invalid-ean")
            .set("Authorization", bearer(vendor.accessToken));

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects deactivation of missing products", async () => {
        const admin = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .patch("/api/products/prod_missing/deactivate")
            .set("Authorization", bearer(admin.accessToken));

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            message: "Product not found",
        });
    });
});
