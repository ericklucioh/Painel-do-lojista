"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/providers/toaster";
import { TextField } from "@/components/ui/form-field";
import { authService } from "@/services/auth.service";
import { LoginSchema, type LoginFormValues } from "@/schemas/auth.schema";

function resolveRedirectTarget(nextPath: string | null): string {
    if (nextPath === null || nextPath.trim().length === 0) {
        return "/dashboard";
    }

    if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
        return "/dashboard";
    }

    if (nextPath === "/login") {
        return "/dashboard";
    }

    return nextPath;
}

export function LoginForm({ nextPath }: { nextPath: string | null }) {
    const router = useRouter();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            await authService.login(values);
            toast({
                variant: "success",
                title: "Sessão iniciada com sucesso",
            });
            router.replace(resolveRedirectTarget(nextPath));
            router.refresh();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível entrar no sistema.";

            toast({
                variant: "error",
                title: "Falha no login",
                description: message,
            });
        }
    });

    return (
        <section className="rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="mb-8 space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Acesso
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                    Entrar no sistema
                </h1>
                <p className="text-sm leading-6 text-slate-600">
                    Use o e-mail e a senha cadastrados. O Next grava os cookies
                    httpOnly e controla a sessão no servidor.
                </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
                <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <TextField
                    label="Senha"
                    type="password"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register("password")}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </section>
    );
}
