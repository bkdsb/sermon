import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:grid-cols-2 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-[var(--primary)]">Prepare sermões com referências rápidas</h1>
        <p className="mt-3 max-w-prose text-[var(--muted)]">
          Base pronta com Bíblia local em JSON, busca fuzzy de versículos e editor com auto-sugestão via <code>@</code>.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:items-end sm:justify-center">
        <Link
          href="/sermoes/nova"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 sm:w-auto"
        >
          Novo sermão
        </Link>
        <Link
          href="/biblia/jo/11"
          className="inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold transition hover:bg-black/5 sm:w-auto"
        >
          Abrir Bíblia
        </Link>
      </div>
    </section>
  );
}
