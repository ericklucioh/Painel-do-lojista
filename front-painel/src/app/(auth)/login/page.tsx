import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Acesso
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Entrar no sistema
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Aqui depois entra o formulário com JWT, Zod e React Hook Form.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Placeholder da tela de login.
        </div>
        <Link
          href="/"
          className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Voltar
        </Link>
      </div>
    </section>
  );
}
