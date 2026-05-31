import type { RequestHandler, Router } from "express";

export interface RouteInvocationOptions {
    body?: unknown;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
}

export interface RouteInvocationResponse {
    statusCode: number;
    body: unknown;
    cookies: Array<{
        name: string;
        value: string;
        options: unknown;
    }>;
}

function normalizePath(path: string): string {
    if (path === "/") {
        return "/";
    }

    return path.replace(/\/+$/, "");
}

function splitSegments(path: string): string[] {
    const normalized = normalizePath(path);
    if (normalized === "/") {
        return [];
    }

    return normalized.replace(/^\/+/, "").split("/");
}

function matchPattern(pattern: string, actualPath: string): Record<string, string> | null {
    const patternSegments = splitSegments(pattern);
    const actualSegments = splitSegments(actualPath);

    if (patternSegments.length !== actualSegments.length) {
        return null;
    }

    const params: Record<string, string> = {};

    for (let index = 0; index < patternSegments.length; index += 1) {
        const patternSegment = patternSegments[index];
        const actualSegment = actualSegments[index];

        if (patternSegment === undefined || actualSegment === undefined) {
            return null;
        }

        if (patternSegment.startsWith(":")) {
            params[patternSegment.slice(1)] = actualSegment;
            continue;
        }

        if (patternSegment !== actualSegment) {
            return null;
        }
    }

    return params;
}

function findRouteLayer(router: Router, method: string, path: string) {
    return router.stack.find((layer) => {
        if (layer.route === undefined) {
            return false;
        }

        const routeMethod = layer.route.methods[method.toLowerCase()];
        if (!routeMethod) {
            return false;
        }

        return matchPattern(layer.route.path, path) !== null;
    });
}

export async function invokeRouterRoute(
    router: Router,
    method: string,
    path: string,
    options: RouteInvocationOptions = {},
    prependHandlers: RequestHandler[] = [],
): Promise<RouteInvocationResponse> {
    const routeLayer = findRouteLayer(router, method, path);
    if (routeLayer === undefined || routeLayer.route === undefined) {
        throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
    }

    const params = matchPattern(routeLayer.route.path, path);
    if (params === null) {
        throw new Error(`Route ${method.toUpperCase()} ${path} did not match pattern`);
    }

    const middlewareHandlers = router.stack
        .filter((layer) => layer.route === undefined)
        .map((layer) => layer.handle as RequestHandler);
    const routeHandlers = routeLayer.route.stack.map(
        (layer) => layer.handle as RequestHandler,
    );
    const handlers = [...prependHandlers, ...middlewareHandlers, ...routeHandlers];

    const response: RouteInvocationResponse = {
        statusCode: 200,
        body: undefined,
        cookies: [],
    };

    const req = {
        body: options.body ?? {},
        query: options.query ?? {},
        params,
        headers: options.headers ?? {},
        method: method.toUpperCase(),
    } as Parameters<RequestHandler>[0];

    const res = {
        status(code: number) {
            response.statusCode = code;
            return this;
        },
        json(payload: unknown) {
            response.body = payload;
            settled = true;
            resolvePromise();
            return this;
        },
        cookie(name: string, value: string, cookieOptions: unknown) {
            response.cookies.push({
                name,
                value,
                options: cookieOptions,
            });
            return this;
        },
    } as Parameters<RequestHandler>[1];

    let resolvePromise: () => void = () => {};
    let settled = false;

    await new Promise<void>((resolve, reject) => {
        resolvePromise = resolve;
        let index = 0;

        const next: Parameters<RequestHandler>[2] = (error?: unknown) => {
            if (settled) {
                return;
            }

            if (error !== undefined) {
                settled = true;
                reject(error);
                return;
            }

            const handler = handlers[index];
            index += 1;

            if (handler === undefined) {
                settled = true;
                resolve();
                return;
            }

            try {
                const result = handler(req, res, next);
                if (result instanceof Promise) {
                    void result.catch(reject);
                }
            } catch (caughtError) {
                settled = true;
                reject(caughtError);
            }
        };

        next();
    });

    return response;
}
