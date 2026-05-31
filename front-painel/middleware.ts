import { NextRequest, NextResponse } from "next/server";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    ACCESS_TOKEN_MAX_AGE_SECONDS,
    BACKEND_URL,
    REFRESH_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth-config";
import { getAuthUserFromPayload, verifyAccessToken } from "@/lib/auth-jwt";

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

function serializeCookies(cookies: Array<[string, string]>): string {
    return cookies.map(([name, value]) => `${name}=${value}`).join("; ");
}

function applyAuthCookies(
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

function redirectWithCookies(
    url: URL,
    cookiesData: {
        accessToken: string;
        refreshToken: string;
    } | null,
): NextResponse {
    const response = NextResponse.redirect(url);

    if (cookiesData === null) {
        return response;
    }

    applyAuthCookies(
        response,
        cookiesData.accessToken,
        cookiesData.refreshToken,
    );

    return response;
}

async function refreshSession(request: NextRequest): Promise<{
    accessToken: string;
    refreshToken: string;
    session: {
        id: string;
        nome: string;
        tipo: "ADMIN" | "VENDEDOR";
    };
} | null> {
    const refreshToken = readCookieValue(
        request.headers.get("cookie"),
        REFRESH_TOKEN_COOKIE_NAME,
    );

    if (!refreshToken) {
        return null;
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
        },
        body: JSON.stringify({}),
    });

    if (!backendResponse.ok) {
        return null;
    }

    const body = (await backendResponse.json().catch(() => null)) as
        | {
              accessToken?: string;
              refreshToken?: string;
          }
        | null;

    if (!body?.accessToken || !body.refreshToken) {
        return null;
    }

    const payload = await verifyAccessToken(body.accessToken);
    if (!payload?.sub || !payload.nome || !payload.tipo) {
        return null;
    }

    return {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        session: getAuthUserFromPayload(payload),
    };
}

async function resolveSession(
    request: NextRequest,
): Promise<
    | {
          session: {
              id: string;
              nome: string;
              tipo: "ADMIN" | "VENDEDOR";
          };
          responseHeaders?: Headers;
          cookies?: {
              accessToken: string;
              refreshToken: string;
          };
      }
    | null
> {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (accessToken) {
        const payload = await verifyAccessToken(accessToken);
        if (payload?.sub && payload.nome && payload.tipo) {
            return {
                session: getAuthUserFromPayload(payload),
            };
        }
    }

    const refreshed = await refreshSession(request);
    if (!refreshed) {
        return null;
    }

    const requestHeaders = new Headers(request.headers);
    const cookieEntries = request.cookies
        .getAll()
        .map((cookie) => [cookie.name, cookie.value] as [string, string]);
    const cookieMap = new Map(cookieEntries);
    cookieMap.set(ACCESS_TOKEN_COOKIE_NAME, refreshed.accessToken);
    cookieMap.set(REFRESH_TOKEN_COOKIE_NAME, refreshed.refreshToken);
    requestHeaders.set(
        "cookie",
        serializeCookies(Array.from(cookieMap.entries())),
    );

    return {
        session: refreshed.session,
        responseHeaders: requestHeaders,
        cookies: {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
        },
    };
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

        return NextResponse.redirect(loginUrl);
    }

    if (isAdminPath(pathname) && resolvedSession.session.tipo !== "ADMIN") {
        const dashboardUrl = new URL("/dashboard", request.url);
        dashboardUrl.searchParams.set("accessDenied", "1");
        return redirectWithCookies(
            dashboardUrl,
            resolvedSession.cookies ?? null,
        );
    }

    if (resolvedSession.responseHeaders && resolvedSession.cookies) {
        const response = NextResponse.next({
            request: {
                headers: resolvedSession.responseHeaders,
            },
        });

        applyAuthCookies(
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
