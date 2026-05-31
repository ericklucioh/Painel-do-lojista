import { hashSync } from "bcryptjs";
import type { TestUserRecord } from "./test-records";

const now = new Date("2026-05-24T10:00:00.000Z");

export const usersFixture: TestUserRecord[] = [
    {
        id: "user_admin_1",
        cpf: "11111111111",
        fullName: "Admin do Sistema",
        email: "admin@painel.com",
        passwordHash: hashSync("123456", 10),
        role: "ADMIN",
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
    {
        id: "user_vendor_1",
        cpf: "22222222222",
        fullName: "Joao Vendedor",
        email: "joao@painel.com",
        passwordHash: hashSync("123456", 10),
        role: "VENDEDOR",
        deactivatedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
    },
];
