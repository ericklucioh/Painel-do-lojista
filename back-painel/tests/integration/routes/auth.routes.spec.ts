import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { bearer, loginAsAdmin, loginAsVendor } from "../../helpers/test-http";
import {
    buildExpiredAccessToken,
    buildExpiredRefreshToken,
} from "../../helpers/auth-token";

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
        const loginResponse = await loginAsVendor(testApp.app);

        const refreshResponse = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: loginResponse.refreshToken,
            });

        expect(refreshResponse.statusCode).toBe(200);
        expect(refreshResponse.body).toMatchObject({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
            expiresIn: 900,
            user: {
                id: "user_vendor_1",
                nome: "Joao Vendedor",
                tipo: "VENDEDOR",
            },
        });
        expect(refreshResponse.headers["set-cookie"]).toBeUndefined();
    });

    it("returns the current authenticated user", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

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
        const loginResponse = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/auth/logout")
            .send({
                refreshToken: loginResponse.refreshToken,
            });

        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject({
            ok: true,
        });
    });

    it("rejects invalid login credentials", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
                password: "senha-errada",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Credenciais inválidas",
        });
    });

    it("rejects malformed login payloads", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "admin@painel.com",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects refresh requests without a token", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects refresh requests with malformed tokens", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: "not-a-jwt",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Refresh token inválido",
        });
    });

    it("rejects /me without a bearer token", async () => {
        const response = await request(testApp.app).get("/api/auth/me");

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects logout without a refresh token", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/logout")
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects login for deactivated users", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const createResponse = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Usuario Desativado",
                cpf: "77777777777",
                email: "desativado@painel.com",
                password: "123456",
                role: "VENDEDOR",
            })
            .expect(201);

        await request(testApp.app)
            .patch(`/api/users/${createResponse.body.user.id}/deactivate`)
            .set("Authorization", bearer(accessToken))
            .expect(200);

        const loginResponse = await request(testApp.app)
            .post("/api/auth/login")
            .send({
                email: "desativado@painel.com",
                password: "123456",
            });

        expect(loginResponse.statusCode).toBe(401);
        expect(loginResponse.body).toMatchObject({
            message: "Credenciais inválidas",
        });
    });

    it("rejects invalid bearer tokens on /me", async () => {
        const response = await request(testApp.app)
            .get("/api/auth/me")
            .set("Authorization", "Bearer token-invalido");

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token inválido",
        });
    });

    it("rejects expired bearer tokens on /me", async () => {
        const expiredToken = buildExpiredAccessToken({
            role: "ADMIN",
            sub: "user_admin_1",
            email: "admin@painel.com",
            nome: "Admin do Sistema",
        });

        const response = await request(testApp.app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${expiredToken}`);

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token inválido",
        });
    });

    it("rejects logout with malformed refresh tokens", async () => {
        const response = await request(testApp.app)
            .post("/api/auth/logout")
            .send({
                refreshToken: "token-invalido",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Refresh token inválido",
        });
    });

    it("rejects refresh with expired refresh tokens", async () => {
        const expiredRefreshToken = buildExpiredRefreshToken({
            role: "ADMIN",
            sub: "user_admin_1",
            email: "admin@painel.com",
            nome: "Admin do Sistema",
        });

        const refreshResponse = await request(testApp.app)
            .post("/api/auth/refresh")
            .send({
                refreshToken: expiredRefreshToken,
            });

        expect(refreshResponse.statusCode).toBe(401);
        expect(refreshResponse.body).toMatchObject({
            message: "Refresh token inválido",
        });
    });
});
