import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_28px_rgba(28,35,46,0.08)] sm:grid-cols-[1.15fr_0.85fr] sm:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Sermon Workspace</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-[var(--primary)]">Prepare sermões com precisão bíblica</h1>
        <p className="mt-4 max-w-prose text-sm leading-7 text-[var(--muted)]">
          Base com ACF e ARA, busca inteligente de versículos, referências cruzadas e editor com sugestões rápidas usando
          <code className="mx-1 rounded bg-[#f2ece0] px-1.5 py-0.5 text-xs">@</code>
          para referências.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sermoes/nova"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Novo sermão
          </Link>
          <Link
            href="/biblia/gn/1"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Abrir Bíblia
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:content-center">
        <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Tons e direção</p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            Paleta sóbria com acentos clássicos, inspiração reformada sutil e UI minimalista orientada à leitura.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Modo estudo</p>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            Navegue por AT/NT, filtre livros, salte para capítulo e versículo, copie trechos já com referência formatada.
          </p>
        </div>
      </div>
    </section>
  );
}
