import { describe, expect, it } from "vitest";
import { createTestModules } from "../../helpers/test-modules";
import { invokeRouterRoute } from "../../helpers/route-invoker";

describe("auth routes", () => {
    it("login and refresh with real controller and service", async () => {
        const modules = createTestModules();

        const loginResponse = await invokeRouterRoute(
            modules.authRouter,
            "POST",
            "/login",
            {
                body: {
                    email: "admin@painel.com",
                    password: "123456",
                },
            },
        );

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.body).toMatchObject({
            user: {
                id: "user_admin_1",
                nome: "Admin do Sistema",
                tipo: "ADMIN",
            },
        });
        expect(loginResponse.cookies).toHaveLength(2);

        const refreshToken = loginResponse.body as {
            refreshToken: string;
        };

        const refreshResponse = await invokeRouterRoute(
            modules.authRouter,
            "POST",
            "/refresh",
            {
                body: {
                    refreshToken: refreshToken.refreshToken,
                },
            },
        );

        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body).toMatchObject({
            expiresIn: 900,
        });
    });
});
