"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { readAuthSessionFromDocumentCookie } from "@/lib/auth-session";

export function AuthSessionSync() {
    const user = useAuthStore((state) => state.user);
    const setSession = useAuthStore((state) => state.setSession);
    const clearSession = useAuthStore((state) => state.clearSession);

    useEffect(() => {
        const cookieSession = readAuthSessionFromDocumentCookie();

        if (cookieSession === null) {
            if (user !== null) {
                clearSession();
            }

            return;
        }

        if (
            user === null ||
            user.id !== cookieSession.id ||
            user.nome !== cookieSession.nome ||
            user.tipo !== cookieSession.tipo
        ) {
            setSession(cookieSession);
        }
    }, [clearSession, setSession, user]);

    return null;
}
