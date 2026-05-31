import { NextResponse, type NextRequest } from "next/server";
import { refreshOnBackend } from "@/lib/auth-backend";
import { readCookieValue, setAuthCookies } from "@/lib/auth-cookies";
import { REFRESH_TOKEN_COOKIE_NAME } from "@/lib/auth-config";

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

    const backendResponse = await refreshOnBackend(refreshToken);

    if (!backendResponse.ok || !backendResponse.data) {
        return NextResponse.json(
            {
                message: backendResponse.message,
            },
            { status: backendResponse.status },
        );
    }

    const response = NextResponse.json(
        { user: backendResponse.data.user },
        { status: 200 },
    );
    setAuthCookies(
        response,
        backendResponse.data.accessToken,
        backendResponse.data.refreshToken,
    );

    return response;
}
