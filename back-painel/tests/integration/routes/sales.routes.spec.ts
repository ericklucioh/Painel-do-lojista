import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";
import { buildAccessToken } from "../../helpers/auth-token";
import {
    CancelSaleResponseSchema,
    CreateSaleResponseSchema,
    PrintReceiptResponseSchema,
} from "../../../src/modules/sales/sales.schema";

let modules: ReturnType<typeof createTestModules>;

describe("sales routes", () => {
    beforeAll(() => {
        modules = createTestModules();
    });

    afterAll(async () => {
        await modules.close();
    });

    it("completes the sale flow with the official controller contract", async () => {
        const headers = {
            authorization: `Bearer ${buildAccessToken({
                role: "VENDEDOR",
                sub: "user_vendor_1",
                nome: "Joao Vendedor",
            })}`,
        };

        const saleResponse = await invokeRouterRoute(
            modules.salesRouter,
            "POST",
            "/",
            {
                headers,
                body: {
                    cashRegisterId: "cash_register_fake_1",
                    discountAmount: 5,
                    paymentMethod: "DINHEIRO",
                    items: [
                        { productId: "prod_001", quantity: 1 },
                        { productId: "prod_002", quantity: 2 },
                    ],
                },
            },
        );

        expect(saleResponse.statusCode).toBe(201);
        expect(
            CreateSaleResponseSchema.parse(saleResponse.body),
        ).toMatchObject({
            sale: {
                cashRegisterId: "cash_register_fake_1",
                soldByUserId: "user_vendor_1",
                soldByUserName: "Joao Vendedor",
                receiptNumber: "001",
                paymentMethod: "DINHEIRO",
                status: "CONFIRMED",
                items: expect.arrayContaining([
                    expect.objectContaining({
                        productId: "prod_001",
                        quantity: 1,
                    }),
                    expect.objectContaining({
                        productId: "prod_002",
                        quantity: 2,
                    }),
                ]),
            },
        });

        const saleId = (saleResponse.body as { sale: { id: string } }).sale.id;

        const printResponse = await invokeRouterRoute(
            modules.salesRouter,
            "POST",
            "/print-receipt",
            {
                headers,
                body: {
                    saleId,
                },
            },
        );

        expect(printResponse.statusCode).toBe(200);
        expect(PrintReceiptResponseSchema.parse(printResponse.body)).toMatchObject({
            success: true,
            saleId,
        });

        const cancelResponse = await invokeRouterRoute(
            modules.salesRouter,
            "DELETE",
            `/${saleId}`,
            {
                headers,
            },
        );

        expect(cancelResponse.statusCode).toBe(200);
        expect(CancelSaleResponseSchema.parse(cancelResponse.body)).toMatchObject({
            success: true,
            sale: {
                id: saleId,
                status: "CANCELLED",
            },
        });
    });
});
