import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
    FRONT_AUTH_SESSION_COOKIE_NAME,
    readAuthSessionFromCookieSource,
} from "./src/lib/auth-session";

function isProtectedPath(pathname: string): boolean {
    return (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/admin" ||
        pathname.startsWith("/admin/") ||
        pathname === "/vendas" ||
        pathname.startsWith("/vendas/")
    );
}

function isAdminPath(pathname: string): boolean {
    return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const sessionCookie = request.cookies.get(
        FRONT_AUTH_SESSION_COOKIE_NAME,
    )?.value;
    const session = readAuthSessionFromCookieSource(
        sessionCookie === undefined ? null : `${FRONT_AUTH_SESSION_COOKIE_NAME}=${sessionCookie}`,
    );

    if (pathname === "/login") {
        if (session !== null) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
    }

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    if (session === null) {
        const loginUrl = new URL("/login", request.url);
        const nextPath = `${pathname}${search}`;
        if (nextPath.length > 0) {
            loginUrl.searchParams.set("next", nextPath);
        }

        return NextResponse.redirect(loginUrl);
    }

    if (isAdminPath(pathname) && session.tipo !== "ADMIN") {
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("accessDenied", "1");
        return NextResponse.redirect(dashboardUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*", "/vendas", "/vendas/:path*"],
};
