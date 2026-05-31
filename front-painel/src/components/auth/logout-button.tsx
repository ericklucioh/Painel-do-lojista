"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        router.replace("/login");
        router.refresh();
    };

    return (
        <button type="button" onClick={handleLogout}>
            Sair
        </button>
    );
}
