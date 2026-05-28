import Link from "next/link";

const sections = [
    {
        title: "Autenticação",
        description: "Fluxo de login com JWT e renovação automática.",
        href: "/login",
    },
    {
        title: "Usuários",
        description: "Cadastro, listagem, edição e desativação.",
        href: "/admin/usuarios",
    },
    {
        title: "Produtos",
        description: "Gestão de catálogo com EAN, preço e estoque crítico.",
        href: "/admin/produtos",
    },
    {
        title: "Estoque",
        description: "Registro e histórico de movimentações.",
        href: "/admin/estoque",
    },
    {
        title: "Vendas",
        description: "PDV com carrinho, desconto e finalização.",
        href: "/vendas",
    },
];

export default function Home() {
    return (
        <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
            <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-10">
                <div className="max-w-3xl space-y-5">
                    <span className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur">
                        Painel do Lojista
                    </span>
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                        Base inicial do desafio técnico, organizada para evoluir
                        para CRUD, estoque e PDV.
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                        A estrutura já está separada por domínio e com rotas em
                        português, como o enunciado pede. A próxima etapa é
                        plugar autenticação, API e os formulários.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {sections.map((section) => (
                        <Link
                            key={section.href}
                            href={section.href}
                            className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition-transform duration-200 hover:-translate-y-1 hover:border-slate-300"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-950">
                                    {section.title}
                                </h2>
                                <span className="text-sm text-slate-400 transition-colors group-hover:text-slate-700">
                                    →
                                </span>
                            </div>
                            <p className="text-sm leading-6 text-slate-600">
                                {section.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
