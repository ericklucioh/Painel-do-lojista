import { NextRequest, NextResponse } from "next/server";
import {
    fetchCurrentUserOnBackend,
    refreshOnBackend,
} from "@/lib/auth-backend";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-config";

type AuthSession = {
    id: string;
    nome: string;
    tipo: "ADMIN" | "VENDEDOR";
};

type ResolvedSession = {
    session: AuthSession;
    cookies?: {
        accessToken: string;
        refreshToken: string;
    };
} | null;

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

function serializeCookies(entries: Array<[string, string]>): string {
    return entries
        .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
        .join("; ");
}

function buildRequestHeaders(
    request: NextRequest,
    cookies: {
        accessToken: string;
        refreshToken: string;
    },
): Headers {
    const headers = new Headers(request.headers);
    const cookieMap = new Map(
        request.cookies
            .getAll()
            .map((cookie) => [cookie.name, cookie.value] as [string, string]),
    );

    cookieMap.set(ACCESS_TOKEN_COOKIE_NAME, cookies.accessToken);
    cookieMap.set(REFRESH_TOKEN_COOKIE_NAME, cookies.refreshToken);
    headers.set("cookie", serializeCookies(Array.from(cookieMap.entries())));

    return headers;
}

async function resolveSession(request: NextRequest): Promise<ResolvedSession> {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    if (accessToken) {
        const currentUser = await fetchCurrentUserOnBackend(accessToken);
        if (currentUser.ok && currentUser.data) {
            return {
                session: currentUser.data,
            };
        }
    }

    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
    if (!refreshToken) {
        return null;
    }

    const refreshed = await refreshOnBackend(refreshToken);
    if (!refreshed.ok || !refreshed.data) {
        return null;
    }

    return {
        session: refreshed.data.user,
        cookies: {
            accessToken: refreshed.data.accessToken,
            refreshToken: refreshed.data.refreshToken,
        },
    };
}

function redirectWithCookies(
    url: URL,
    cookies: {
        accessToken: string;
        refreshToken: string;
    } | null,
): NextResponse {
    const response = NextResponse.redirect(url);

    if (cookies !== null) {
        setAuthCookies(response, cookies.accessToken, cookies.refreshToken);
    }

    return response;
}

export async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    if (pathname === "/login") {
        const currentSession = await resolveSession(request);
        if (currentSession !== null) {
            return redirectWithCookies(
                new URL("/dashboard", request.url),
                currentSession.cookies ?? null,
            );
        }

        return NextResponse.next();
    }

    if (!isProtectedPath(pathname)) {
        return NextResponse.next();
    }

    const resolvedSession = await resolveSession(request);
    if (resolvedSession === null) {
        const loginUrl = new URL("/login", request.url);
        const nextPath = `${pathname}${search}`;
        if (nextPath.length > 0) {
            loginUrl.searchParams.set("next", nextPath);
        }

        const response = NextResponse.redirect(loginUrl);
        clearAuthCookies(response);
        return response;
    }

    if (isAdminPath(pathname) && resolvedSession.session.tipo !== "ADMIN") {
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("accessDenied", "1");
        return redirectWithCookies(
            dashboardUrl,
            resolvedSession.cookies ?? null,
        );
    }

    if (resolvedSession.cookies) {
        const response = NextResponse.next({
            request: {
                headers: buildRequestHeaders(request, resolvedSession.cookies),
            },
        });

        setAuthCookies(
            response,
            resolvedSession.cookies.accessToken,
            resolvedSession.cookies.refreshToken,
        );

        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/login",
        "/dashboard",
        "/dashboard/:path*",
        "/admin",
        "/admin/:path*",
        "/vendas",
        "/vendas/:path*",
    ],
};
