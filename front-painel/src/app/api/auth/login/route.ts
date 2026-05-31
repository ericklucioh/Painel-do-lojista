import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { BACKEND_URL, ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME, ACCESS_TOKEN_MAX_AGE_SECONDS, REFRESH_TOKEN_MAX_AGE_SECONDS } from "@/lib/auth-config";

const LoginBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

type BackendLoginResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        nome: string;
        tipo: "ADMIN" | "VENDEDOR";
    };
};

function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string,
): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const parsedBody = LoginBodySchema.safeParse(body);

    if (!parsedBody.success) {
        return NextResponse.json(
            { message: "Validation error", issues: parsedBody.error.issues },
            { status: 400 },
        );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedBody.data),
    });

    const responseBody = (await backendResponse
        .json()
        .catch(() => null)) as BackendLoginResponse | { message?: string } | null;

    if (!backendResponse.ok) {
        return NextResponse.json(
            {
                message:
                    (responseBody &&
                        "message" in responseBody &&
                        responseBody.message) ||
                    "Não foi possível entrar no sistema.",
            },
            { status: backendResponse.status },
        );
    }

    const loginData = responseBody as BackendLoginResponse;
    const response = NextResponse.json(
        {
            user: loginData.user,
        },
        { status: 200 },
    );

    setAuthCookies(
        response,
        loginData.accessToken,
        loginData.refreshToken,
    );

    return response;
}
