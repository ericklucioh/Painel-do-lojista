import type { Express } from "express";
import request from "supertest";

export interface LoginResult {
    accessToken: string;
    refreshToken: string;
}

export async function loginAs(
    app: Express,
    email: string,
    password: string,
): Promise<LoginResult> {
    const response = await request(app)
        .post("/api/auth/login")
        .send({ email, password })
        .expect(200);

    return {
        accessToken: response.body.accessToken as string,
        refreshToken: response.body.refreshToken as string,
    };
}

export async function loginAsAdmin(app: Express): Promise<LoginResult> {
    return loginAs(app, "admin@painel.com", "123456");
}

export async function loginAsVendor(app: Express): Promise<LoginResult> {
    return loginAs(app, "joao@painel.com", "123456");
}

export async function loginAsWrongUser(
    app: Express,
    expectedRole: "ADMIN" | "VENDEDOR",
): Promise<LoginResult> {
    if (expectedRole === "ADMIN") {
        return loginAsVendor(app);
    }

    return loginAsAdmin(app);
}

export function bearer(accessToken: string): string {
    return `Bearer ${accessToken}`;
}
