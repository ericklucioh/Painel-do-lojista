"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { clearAuthSessionCookie } from "@/lib/auth-session";

export function LogoutButton() {
    const router = useRouter();
    const clearSession = useAuthStore((state) => state.clearSession);

    const handleLogout = () => {
        clearSession();
        clearAuthSessionCookie();
        router.replace("/login");
        router.refresh();
    };

    return (
        <button type="button" onClick={handleLogout}>
            Sair
        </button>
    );
}
