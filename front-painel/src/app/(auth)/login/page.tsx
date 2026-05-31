import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage({
    searchParams,
}: {
    searchParams?: {
        next?: string;
    };
}) {
    const nextPath = typeof searchParams?.next === "string" ? searchParams.next : null;

    return (
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <aside className="relative flex flex-col justify-between gap-10 overflow-hidden bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(148,163,184,0.28),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),_transparent_28%)]" />
                    <div className="relative space-y-6">
                        <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
                            Painel do Lojista
                        </span>
                        <div className="space-y-4">
                            <h2 className="max-w-md text-4xl font-semibold tracking-tight sm:text-5xl">
                                Login pronto para validar o fluxo do desafio.
                            </h2>
                            <p className="max-w-md text-sm leading-6 text-slate-300 sm:text-base">
                                O backend responde com JWT em cookie httpOnly, o
                                Axios renova a sessão automaticamente e a tela
                                já está preparada com Zod e React Hook Form.
                            </p>
                        </div>
                    </div>

                    <div className="relative grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <strong className="block text-white">
                                JWT + Refresh
                            </strong>
                            <span className="mt-1 block leading-6">
                                Sessão autenticada sem expor token no
                                JavaScript.
                            </span>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <strong className="block text-white">
                                Validação Zod
                            </strong>
                            <span className="mt-1 block leading-6">
                                E-mail e senha já tratados no formulário.
                            </span>
                        </div>
                    </div>
                </aside>

                <div className="p-4 sm:p-6 lg:p-8">
                    <LoginForm nextPath={nextPath} />
                </div>
            </div>
        </section>
    );
}
