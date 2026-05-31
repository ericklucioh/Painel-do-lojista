import { NextResponse, type NextRequest } from "next/server";
import { logoutOnBackend } from "@/lib/auth-backend";
import { clearAuthCookies, readCookieValue } from "@/lib/auth-cookies";
import { REFRESH_TOKEN_COOKIE_NAME } from "@/lib/auth-config";

export async function POST(request: NextRequest) {
    const refreshToken = readCookieValue(
        request.headers.get("cookie"),
        REFRESH_TOKEN_COOKIE_NAME,
    );

    const response = NextResponse.json({ ok: true }, { status: 200 });

    if (refreshToken) {
        try {
            await logoutOnBackend(refreshToken);
        } catch {
            // Best effort: the browser session still gets cleared locally.
        }
    }

    clearAuthCookies(response);
    return response;
}
