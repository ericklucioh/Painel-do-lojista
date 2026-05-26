import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Dashboard
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">
          Selecione uma área para começar.
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Esta página serve como entrada interna do sistema e centraliza os
          atalhos principais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/usuarios"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:bg-white"
        >
          <strong className="block text-slate-950">Usuários</strong>
          <span className="mt-1 block text-sm text-slate-600">
            Acesso ao CRUD administrativo.
          </span>
        </Link>
        <Link
          href="/vendas"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:bg-white"
        >
          <strong className="block text-slate-950">Vendas</strong>
          <span className="mt-1 block text-sm text-slate-600">
            Entrada no PDV e finalização da venda.
          </span>
        </Link>
      </div>
    </div>
  );
}
