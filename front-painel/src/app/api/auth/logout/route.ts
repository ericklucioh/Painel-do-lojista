import { NextResponse } from "next/server";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-config";

function clearAuthCookies(response: NextResponse): void {
    response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });
}

export async function POST() {
    const response = NextResponse.json({ ok: true }, { status: 200 });
    clearAuthCookies(response);
    return response;
}
