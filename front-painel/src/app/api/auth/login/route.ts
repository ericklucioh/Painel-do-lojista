import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { loginOnBackend } from "@/lib/auth-backend";
import { setAuthCookies } from "@/lib/auth-cookies";

const LoginBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null);
    const parsedBody = LoginBodySchema.safeParse(body);

    if (!parsedBody.success) {
        return NextResponse.json(
            { message: "Validation error", issues: parsedBody.error.issues },
            { status: 400 },
        );
    }

    const backendResponse = await loginOnBackend(parsedBody.data);

    if (!backendResponse.ok || !backendResponse.data) {
        return NextResponse.json(
            {
                message: backendResponse.message,
            },
            { status: backendResponse.status },
        );
    }

    const response = NextResponse.json(
        {
            user: backendResponse.data.user,
        },
        { status: 200 },
    );

    setAuthCookies(
        response,
        backendResponse.data.accessToken,
        backendResponse.data.refreshToken,
    );

    return response;
}
