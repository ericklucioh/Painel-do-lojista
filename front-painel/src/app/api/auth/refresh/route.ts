import { NextResponse, type NextRequest } from "next/server";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    BACKEND_URL,
    REFRESH_TOKEN_COOKIE_NAME,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";

type BackendRefreshResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
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

function readCookieValue(
    cookieHeader: string | null,
    cookieName: string,
): string | null {
    if (!cookieHeader) {
        return null;
    }

    const entries = cookieHeader.split(";").map((entry) => entry.trim());
    const match = entries.find((entry) => entry.startsWith(`${cookieName}=`));

    if (!match) {
        return null;
    }

    return match.slice(cookieName.length + 1);
}

export async function POST(request: NextRequest) {
    const refreshToken = readCookieValue(
        request.headers.get("cookie"),
        REFRESH_TOKEN_COOKIE_NAME,
    );

    if (!refreshToken) {
        return NextResponse.json(
            { message: "Refresh token ausente" },
            { status: 401 },
        );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
        },
        body: JSON.stringify({}),
    });

    const responseBody = (await backendResponse
        .json()
        .catch(() => null)) as BackendRefreshResponse | { message?: string } | null;

    if (!backendResponse.ok) {
        return NextResponse.json(
            {
                message:
                    (responseBody &&
                        "message" in responseBody &&
                        responseBody.message) ||
                    "Refresh token inválido",
            },
            { status: backendResponse.status },
        );
    }

    const refreshData = responseBody as BackendRefreshResponse;
    const response = NextResponse.json({ ok: true }, { status: 200 });
    setAuthCookies(
        response,
        refreshData.accessToken,
        refreshData.refreshToken,
    );

    return response;
}
