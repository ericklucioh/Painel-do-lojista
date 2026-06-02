import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createTestApp } from "../../helpers/create-test-app";
import { resetTestDatabase } from "../../helpers/test-database";
import { loginAs, bearer } from "../../helpers/test-http";

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
        const { accessToken } = await loginAs(
            testApp.app,
            "admin@painel.com",
            "123456",
        );

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
});
