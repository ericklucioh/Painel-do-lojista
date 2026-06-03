import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { refreshOnBackend } from "@/lib/auth-backend";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    BACKEND_URL,
    REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-config";
import {
    clearAuthCookies,
    readCookieValue,
    setAuthCookies,
} from "@/lib/auth-cookies";

type ProxyResult = {
    body: string;
    headers: Headers;
    status: number;
};

function buildBackendUrl(pathSegments: string[], search: string): string {
    const normalizedPath =
        pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
    return `${BACKEND_URL}/api${normalizedPath}${search}`;
}

function buildRequestHeaders(
    request: NextRequest,
    accessToken: string,
): Headers {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const accept = request.headers.get("accept");

    if (contentType) {
        headers.set("content-type", contentType);
    }

    if (accept) {
        headers.set("accept", accept);
    }

    headers.set("authorization", `Bearer ${accessToken}`);

    return headers;
}

function buildResponse(upstream: ProxyResult): NextResponse {
    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
    });
}

function cloneResponseHeaders(upstream: Response): Headers {
    const headers = new Headers();

    upstream.headers.forEach((value, key) => {
        if (
            key === "content-length" ||
            key === "transfer-encoding" ||
            key === "connection"
        ) {
            return;
        }

        headers.set(key, value);
    });

    return headers;
}

async function forwardToBackend(
    request: NextRequest,
    pathSegments: string[],
    accessToken: string,
    bodyText: string | null,
): Promise<ProxyResult> {
    const upstream = await fetch(
        buildBackendUrl(pathSegments, request.nextUrl.search),
        {
            method: request.method,
            headers: buildRequestHeaders(request, accessToken),
            body: bodyText ?? undefined,
            cache: "no-store",
        },
    );

    return {
        body: await upstream.text(),
        headers: cloneResponseHeaders(upstream),
        status: upstream.status,
    };
}

export async function proxyAuthenticatedRequest(
    request: NextRequest,
    pathSegments: string[],
): Promise<NextResponse> {
    const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const refreshToken = readCookieValue(
        request.headers.get("cookie"),
        REFRESH_TOKEN_COOKIE_NAME,
    );
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const bodyText = hasBody ? await request.text() : null;

    if (!accessToken) {
        if (!refreshToken) {
            const response = NextResponse.json(
                { message: "Sessão expirada." },
                { status: 401 },
            );
            clearAuthCookies(response);
            return response;
        }

        const refreshed = await refreshOnBackend(refreshToken);
        if (!refreshed.ok || !refreshed.data) {
            const response = NextResponse.json(
                { message: "Sessão expirada." },
                { status: 401 },
            );
            clearAuthCookies(response);
            return response;
        }

        const upstream = await forwardToBackend(
            request,
            pathSegments,
            refreshed.data.accessToken,
            bodyText,
        );
        const response = buildResponse(upstream);
        setAuthCookies(
            response,
            refreshed.data.accessToken,
            refreshed.data.refreshToken,
        );
        return response;
    }

    const upstream = await forwardToBackend(
        request,
        pathSegments,
        accessToken,
        bodyText,
    );

    if (upstream.status !== 401 || !refreshToken) {
        return buildResponse(upstream);
    }

    const refreshed = await refreshOnBackend(refreshToken);
    if (!refreshed.ok || !refreshed.data) {
        const response = buildResponse(upstream);
        clearAuthCookies(response);
        return response;
    }

    const retried = await forwardToBackend(
        request,
        pathSegments,
        refreshed.data.accessToken,
        bodyText,
    );
    const response = buildResponse(retried);
    setAuthCookies(
        response,
        refreshed.data.accessToken,
        refreshed.data.refreshToken,
    );
    return response;
}
