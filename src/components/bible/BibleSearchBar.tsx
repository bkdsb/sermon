"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchVersesSmart, type VerseSearchMatchKind } from "@/lib/bible/verseSearch";
import type { BibleVersion } from "@/lib/bible/types";

interface BibleSearchBarProps {
  version: BibleVersion;
}

const KIND_LABEL: Record<VerseSearchMatchKind, string> = {
  reference_exact: "Ref exata",
  reference_neighbor: "Ref próxima",
  text_exact: "Frase exata",
  text_fuzzy: "Semelhante"
};

export default function BibleSearchBar({ version }: BibleSearchBarProps) {
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const results = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    return searchVersesSmart(trimmedQuery, 30, version);
  }, [trimmedQuery, version]);

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/75 p-4 backdrop-blur-sm">
      <div className="space-y-1">
        <label htmlFor="bible-search" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Buscar na Bíblia
        </label>
        <input
          id="bible-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ex.: jo 3:16, jo.11.35, Deus amou o mundo"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
        />
      </div>

      {trimmedQuery.length > 0 && trimmedQuery.length < 2 ? (
        <p className="text-xs text-[var(--muted)]">Digite pelo menos 2 caracteres para buscar.</p>
      ) : null}

      {trimmedQuery.length >= 2 ? (
        results.length > 0 ? (
          <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {results.map((result, index) => (
              <li key={`${result.doc.id}-${result.kind}`}>
                <Link
                  href={`/biblia/${result.doc.book}/${result.doc.chapter}#v${result.doc.verse}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 transition hover:border-[var(--primary)] hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--border)] bg-[#f7f2e8] px-1.5 font-semibold text-[var(--primary)]">
                      {index + 1}
                    </span>
                    <span className="font-semibold uppercase tracking-wide text-[var(--primary)]">
                      {result.doc.book.toUpperCase()} {result.doc.chapter}:{result.doc.verse}
                    </span>
                    <span className="rounded-full bg-[rgba(33,53,79,0.08)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                      {KIND_LABEL[result.kind]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{result.doc.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted)]">Nenhum resultado encontrado.</p>
        )
      ) : null}
    </section>
  );
}
