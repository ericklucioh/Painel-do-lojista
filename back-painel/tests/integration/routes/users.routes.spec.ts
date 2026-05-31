import { describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";
import { verifyToken } from "../../../src/middlewares/verifyToken";
import { buildAccessToken } from "../../helpers/auth-token";

describe("users routes", () => {
    it("runs the real users flow with prisma mock", async () => {
        const modules = createTestModules();
        const headers = {
            authorization: `Bearer ${buildAccessToken({ role: "ADMIN" })}`,
        };

        const listResponse = await invokeRouterRoute(
            modules.usersRouter,
            "GET",
            "/",
            { headers },
            [verifyToken],
        );

        expect(listResponse.statusCode).toBe(200);
        expect(listResponse.body).toMatchObject({
            totalItems: 2,
            totalPages: 1,
        });

        const createResponse = await invokeRouterRoute(
            modules.usersRouter,
            "POST",
            "/",
            {
                headers,
                body: {
                    fullName: "Nova Pessoa",
                    cpf: "33333333333",
                    email: "nova@painel.com",
                    password: "123456",
                    role: "VENDEDOR",
                },
            },
            [verifyToken],
        );

        expect(createResponse.statusCode).toBe(201);
        expect(createResponse.body).toMatchObject({
            user: {
                fullName: "Nova Pessoa",
                email: "nova@painel.com",
                role: "VENDEDOR",
                deletedAt: null,
            },
        });

        const updateResponse = await invokeRouterRoute(
            modules.usersRouter,
            "PUT",
            "/user_admin_1",
            {
                headers,
                body: {
                    fullName: "Admin Atualizado",
                },
            },
            [verifyToken],
        );

        expect(updateResponse.statusCode).toBe(200);
        expect(updateResponse.body).toMatchObject({
            user: {
                id: "user_admin_1",
                fullName: "Admin Atualizado",
            },
        });

        const deactivateResponse = await invokeRouterRoute(
            modules.usersRouter,
            "PATCH",
            "/user_vendor_1/deactivate",
            { headers },
            [verifyToken],
        );

        expect(deactivateResponse.statusCode).toBe(200);
        expect(deactivateResponse.body).toMatchObject({
            success: true,
            user: {
                id: "user_vendor_1",
                deletedAt: expect.any(String),
            },
        });
    });
});
