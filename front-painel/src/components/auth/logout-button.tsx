"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toaster";
import { authService } from "@/services/auth.service";

export function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast({
                variant: "info",
                title: "Sessão encerrada",
            });
        } catch (error) {
            toast({
                variant: "error",
                title: "Falha ao sair do sistema",
                description:
                    error instanceof Error
                        ? error.message
                        : "Não foi possível sair do sistema.",
            });
        } finally {
            router.replace("/login");
            router.refresh();
        }
    };

    return (
        <button type="button" onClick={handleLogout}>
            Sair
        </button>
    );
}
