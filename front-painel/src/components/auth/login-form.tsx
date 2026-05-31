"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "admin@painel.com",
            password: "123456",
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setServerError(null);

        try {
            await authService.login(values);
            router.replace(resolveRedirectTarget(nextPath));
            router.refresh();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Não foi possível entrar no sistema.";

            setServerError(message);
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
                    Use o e-mail e a senha cadastrados. O Next grava os
                    cookies httpOnly e controla a sessão no servidor.
                </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmit}>
                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                        E-mail
                    </span>
                    <input
                        type="email"
                        autoComplete="email"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                        {...register("email")}
                    />
                    {errors.email ? (
                        <span className="text-sm text-rose-600">
                            {errors.email.message}
                        </span>
                    ) : null}
                </label>

                <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                        Senha
                    </span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400"
                        {...register("password")}
                    />
                    {errors.password ? (
                        <span className="text-sm text-rose-600">
                            {errors.password.message}
                        </span>
                    ) : null}
                </label>

                {serverError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {serverError}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Credenciais de teste:{" "}
                <span className="font-medium">admin@painel.com</span> /{" "}
                <span className="font-medium">123456</span>
            </div>
        </section>
    );
}
