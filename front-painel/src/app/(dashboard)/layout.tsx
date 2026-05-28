import type { ReactNode } from "react";
import Link from "next/link";

const navItems = [
    { href: "/dashboard", label: "Início" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/estoque", label: "Estoque" },
    { href: "/vendas", label: "Vendas" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-screen px-6 py-6 sm:px-10 lg:px-16">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                            Painel do Lojista
                        </p>
                        <h1 className="mt-1 text-xl font-semibold text-slate-950">
                            Área interna
                        </h1>
                    </div>

                    <nav className="flex flex-wrap gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </header>

                <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                    {children}
                </section>
            </div>
        </main>
    );
}
