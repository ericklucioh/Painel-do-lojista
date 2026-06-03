import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import {
    bearer,
    loginAsAdmin,
    loginAsWrongUser,
} from "../../helpers/test-http";
import { buildExpiredAccessToken } from "../../helpers/auth-token";

let testApp: ReturnType<typeof createTestApp>;

describe("users routes", () => {
    beforeEach(() => {
        resetTestDatabase();
        testApp = createTestApp();
    });

    afterEach(async () => {
        await testApp.close();
    });

    it("covers the happy path admin user flow", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const listResponse = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", bearer(accessToken))
            .query({ page: 1 })
            .expect(200);

        expect(listResponse.body).toMatchObject({
            page: 1,
            pageSize: 10,
            totalItems: 2,
            totalPages: 1,
            data: expect.arrayContaining([
                expect.objectContaining({
                    id: "user_admin_1",
                    fullName: "Admin do Sistema",
                    email: "admin@painel.com",
                    role: "ADMIN",
                    isActive: true,
                }),
            ]),
        });

        const createResponse = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Nova Pessoa",
                cpf: "33333333333",
                email: "nova@painel.com",
                password: "123456",
                role: "VENDEDOR",
            })
            .expect(201);

        expect(createResponse.body).toMatchObject({
            user: {
                fullName: "Nova Pessoa",
                email: "nova@painel.com",
                role: "VENDEDOR",
                deletedAt: null,
            },
        });

        const createdUserId = createResponse.body.user.id as string;

        const updateResponse = await request(testApp.app)
            .put(`/api/users/${createdUserId}`)
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Nova Pessoa Atualizada",
                role: "ADMIN",
            })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            user: {
                id: createdUserId,
                fullName: "Nova Pessoa Atualizada",
                role: "ADMIN",
            },
        });

        const deactivateResponse = await request(testApp.app)
            .patch(`/api/users/${createdUserId}/deactivate`)
            .set("Authorization", bearer(accessToken))
            .expect(200);

        expect(deactivateResponse.body).toMatchObject({
            success: true,
            user: {
                id: createdUserId,
                deletedAt: expect.any(String),
            },
        });

        const persistedUser = await testApp.prisma.user.findUnique({
            where: { id: createdUserId },
        });

        expect(persistedUser).not.toBeNull();
        expect(persistedUser?.deletedAt).not.toBeNull();
        expect(persistedUser?.deactivatedAt).not.toBeNull();

        const listAfterDeactivate = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", bearer(accessToken))
            .query({ page: 1 })
            .expect(200);

        expect(listAfterDeactivate.body).toMatchObject({
            page: 1,
            pageSize: 10,
            totalItems: 2,
        });
        expect(
            listAfterDeactivate.body.data.some(
                (user: { id: string }) => user.id === createdUserId,
            ),
        ).toBe(false);
    });

    it("lists users using a search filter", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", bearer(accessToken))
            .query({ page: 1, search: "Joao" })
            .expect(200);

        expect(response.body).toMatchObject({
            page: 1,
            pageSize: 10,
            search: "Joao",
            totalItems: 1,
            totalPages: 1,
            data: [
                expect.objectContaining({
                    id: "user_vendor_1",
                    fullName: "Joao Vendedor",
                    email: "joao@painel.com",
                    role: "VENDEDOR",
                    isActive: true,
                }),
            ],
        });
    });

    it("creates an admin user", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Admin Secundario",
                cpf: "33333333333",
                email: "admin2@painel.com",
                password: "123456",
                role: "ADMIN",
            })
            .expect(201);

        expect(response.body).toMatchObject({
            user: {
                fullName: "Admin Secundario",
                email: "admin2@painel.com",
                role: "ADMIN",
                deletedAt: null,
            },
        });
    });

    it("updates only the user name", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const createResponse = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Usuario Temporario",
                cpf: "44444444444",
                email: "temporario@painel.com",
                password: "123456",
                role: "VENDEDOR",
            })
            .expect(201);

        const userId = createResponse.body.user.id as string;

        const updateResponse = await request(testApp.app)
            .put(`/api/users/${userId}`)
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Usuario Renomeado",
            })
            .expect(200);

        expect(updateResponse.body).toMatchObject({
            user: {
                id: userId,
                fullName: "Usuario Renomeado",
                role: "VENDEDOR",
            },
        });
    });

    it("rejects vendor access on admin users routes", async () => {
        const { accessToken } = await loginAsWrongUser(testApp.app, "ADMIN");

        const listResponse = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", bearer(accessToken))
            .query({ page: 1 });

        expect(listResponse.statusCode).toBe(403);
        expect(listResponse.body).toMatchObject({
            message: "Acesso negado",
        });

        const createResponse = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Bloqueado",
                cpf: "55555555555",
                email: "bloqueado@painel.com",
                password: "123456",
                role: "VENDEDOR",
            });

        expect(createResponse.statusCode).toBe(403);
        expect(createResponse.body).toMatchObject({
            message: "Acesso negado",
        });

        const updateResponse = await request(testApp.app)
            .put("/api/users/user_admin_1")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Tentativa Bloqueada",
            });

        expect(updateResponse.statusCode).toBe(403);
        expect(updateResponse.body).toMatchObject({
            message: "Acesso negado",
        });
    });

    it("rejects invalid users list queries", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", bearer(accessToken))
            .query({ page: 0 });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects users list requests without a token", async () => {
        const response = await request(testApp.app)
            .get("/api/users")
            .query({ page: 1 });

        expect(response.statusCode).toBe(401);
        expect(response.body).toMatchObject({
            message: "Token ausente",
        });
    });

    it("rejects invalid and expired bearer tokens on users routes", async () => {
        const invalidResponse = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", "Bearer token-invalido")
            .query({ page: 1 });

        expect(invalidResponse.statusCode).toBe(401);
        expect(invalidResponse.body).toMatchObject({
            message: "Token inválido",
        });

        const expiredToken = buildExpiredAccessToken({
            role: "ADMIN",
            sub: "user_admin_1",
            email: "admin@painel.com",
            nome: "Admin do Sistema",
        });

        const expiredResponse = await request(testApp.app)
            .get("/api/users")
            .set("Authorization", `Bearer ${expiredToken}`)
            .query({ page: 1 });

        expect(expiredResponse.statusCode).toBe(401);
        expect(expiredResponse.body).toMatchObject({
            message: "Token inválido",
        });
    });

    it("rejects duplicate emails on user creation", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Admin Duplicado",
                cpf: "66666666666",
                email: "joao@painel.com",
                password: "123456",
                role: "ADMIN",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Este e-mail já está registrado",
        });
    });

    it("rejects invalid payloads on user creation", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .post("/api/users")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "",
                cpf: "",
                email: "email-invalido",
                password: "",
                role: "VENDEDOR",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });

    it("rejects updates for missing users", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .put("/api/users/user_missing")
            .set("Authorization", bearer(accessToken))
            .send({
                fullName: "Nao Existe",
            });

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            message: "User not found",
        });
    });

    it("rejects empty user updates", async () => {
        const { accessToken } = await loginAsAdmin(testApp.app);

        const response = await request(testApp.app)
            .put("/api/users/user_admin_1")
            .set("Authorization", bearer(accessToken))
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({
            message: "Validation error",
        });
    });
});
