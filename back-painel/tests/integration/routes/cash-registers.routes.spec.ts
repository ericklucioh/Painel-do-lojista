import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";
import { buildAccessToken } from "../../helpers/auth-token";
import { OpenCashRegisterResponseSchema } from "../../../src/modules/cash-registers/cash-registers.schema";

let modules: ReturnType<typeof createTestModules>;

describe("cash-registers routes", () => {
    beforeAll(() => {
        modules = createTestModules();
    });

    afterAll(async () => {
        await modules.close();
    });

    it("opens a cash register with the official controller contract", async () => {
        const headers = {
            authorization: `Bearer ${buildAccessToken({
                role: "VENDEDOR",
                sub: "user_vendor_1",
                nome: "Joao Vendedor",
            })}`,
        };

        const response = await invokeRouterRoute(
            modules.cashRegistersRouter,
            "POST",
            "/open",
            {
                headers,
                body: {
                    initialBalance: 150,
                    note: "Abertura do PDV",
                },
            },
        );

        expect(response.statusCode).toBe(201);
        expect(OpenCashRegisterResponseSchema.parse(response.body)).toMatchObject(
            {
                cashRegister: {
                    openedByUserId: "user_vendor_1",
                    activeOpenedByUserId: "user_vendor_1",
                    initialBalance: 150,
                    status: "ABERTO",
                },
            },
        );
    });
});
