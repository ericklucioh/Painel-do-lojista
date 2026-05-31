import { signAccessToken, type AuthTokenRole } from "../../src/utils/jwt";

interface BuildAccessTokenInput {
    role: AuthTokenRole;
    sub?: string;
    email?: string;
    nome?: string;
}

export function buildAccessToken({
    role,
    sub = "user-1",
    email = "user@example.com",
    nome = "Test User",
}: BuildAccessTokenInput): string {
    return signAccessToken({
        sub,
        email,
        nome,
        tipo: role,
    });
}
