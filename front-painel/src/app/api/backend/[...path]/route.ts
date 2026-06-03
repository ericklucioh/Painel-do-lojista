import { NextRequest, NextResponse } from "next/server";
import { proxyAuthenticatedRequest } from "@/lib/backend-proxy";

type RouteContext = {
    params: Promise<{
        path: string[];
    }>;
};

async function handleRequest(
    request: NextRequest,
    context: RouteContext,
): Promise<NextResponse> {
    const { path } = await context.params;

    if (!path || path.length === 0) {
        return NextResponse.json(
            { message: "Recurso inválido." },
            { status: 404 },
        );
    }

    return proxyAuthenticatedRequest(request, path);
}

export async function GET(request: NextRequest, context: RouteContext) {
    return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
    return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
    return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    return handleRequest(request, context);
}
