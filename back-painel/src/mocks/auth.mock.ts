import { hashSync } from "bcryptjs";
import type {
    AuthLoginResponse,
    AuthRefreshResponse,
    AuthUser,
} from "../modules/auth/auth.schema";

export type AuthMockUser = AuthUser & {
    email: string;
    passwordHash: string;
    isActive: boolean;
};

export const authUsersMock: AuthMockUser[] = [
    {
        id: "user_admin_1",
        nome: "Admin do Sistema",
        tipo: "ADMIN",
        email: "admin@painel.com",
        passwordHash: hashSync("123456", 10),
        isActive: true,
    },
    {
        id: "user_vendor_1",
        nome: "Joao Vendedor",
        tipo: "VENDEDOR",
        email: "joao@painel.com",
        passwordHash: hashSync("123456", 10),
        isActive: true,
    },
];

export const authLoginMock: AuthLoginResponse = {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    expiresIn: 900,
    user: {
        id: "user_admin_1",
        nome: "Admin do Sistema",
        tipo: "ADMIN",
    },
};

export const authRefreshMock: AuthRefreshResponse = {
    accessToken: "mock-access-token-refreshed",
    refreshToken: "mock-refresh-token-refreshed",
    expiresIn: 900,
};
