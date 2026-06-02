import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { bearer, loginAs } from "../../helpers/test-http";

let testApp: ReturnType<typeof createTestApp>;

describe("auth routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("logs in with valid credentials and returns tokens", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "123456",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
            user: {
                id: "user_admin_1",
                nome: "Admin do Sistema",
                tipo: "ADMIN",
            },
        });
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("logs in with a vendor account and returns tokens", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "joao@painel.com",
                password: "123456",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
            user: {
                id: "user_vendor_1",
                nome: "Joao Vendedor",
                tipo: "VENDEDOR",
            },
        });
        expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("refreshes the access token with a valid refresh token", async () => {
        const loginResponse = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "123456",
            })
            .expect(200);

        const refreshResponse = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: loginResponse.body.refreshToken,
            });

        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
            user: {
                id: "user_admin_1",
                nome: "Admin do Sistema",
                tipo: "ADMIN",
            },
        });
        expect(refreshResponse.headers["set-cookie"]).toBeUndefined();
    });

    it("returns the current authenticated user", async () => {
        const { accessToken } = await loginAs(
            testApp.app,
            "admin@painel.com",
            "123456",
        );

        const response = await request(testApp.app)
            .get("/api/auth/me")
            .set("Authorization", bearer(accessToken))
            .expect(200);

        expect(response.body).toMatchObject({
            user: {
                id: "user_admin_1",
                nome: "Admin do Sistema",
                tipo: "ADMIN",
            },
        });
    });

    it("logs out with a valid refresh token", async () => {
        const loginResponse = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "123456",
            })
            .expect(200);

        const response = await request(testApp.app)
            .post("/api/auth/logout")
            .send({
                refreshToken: loginResponse.body.refreshToken,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            ok: true,
        });
    });
});
