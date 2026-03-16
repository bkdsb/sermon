"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 8;

function buildPageButtons(currentPage: number, totalPages: number) {
  if (totalPages <= 1) return [1];

  const pages = new Set<number>([1, totalPages, currentPage]);
  for (let offset = 1; offset <= 2; offset += 1) {
    pages.add(Math.max(1, currentPage - offset));
    pages.add(Math.min(totalPages, currentPage + offset));
  }

  return [...pages].sort((a, b) => a - b);
}

export default function BibleSearchBar({ version }: BibleSearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);

    return () => {
      window.clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, version]);

  const trimmedQuery = debouncedQuery;
  const results = useMemo(() => {
    if (trimmedQuery.length < 2) return [];
    return searchVersesSmart(trimmedQuery, 120, version);
  }, [trimmedQuery, version]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const clampedPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage !== clampedPage) {
      setCurrentPage(clampedPage);
    }
  }, [clampedPage, currentPage]);

  const start = (clampedPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedResults = results.slice(start, end);
  const pageButtons = buildPageButtons(clampedPage, totalPages);

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

      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="text-xs text-[var(--muted)]">Digite pelo menos 2 caracteres para buscar.</p>
      ) : null}

      {trimmedQuery.length >= 2 ? (
        results.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
              <p>
                Mostrando <span className="font-semibold text-[var(--foreground)]">{start + 1}</span>-{" "}
                <span className="font-semibold text-[var(--foreground)]">{Math.min(end, results.length)}</span> de{" "}
                <span className="font-semibold text-[var(--foreground)]">{results.length}</span>
              </p>
              <p>
                Página <span className="font-semibold text-[var(--foreground)]">{clampedPage}</span> de{" "}
                <span className="font-semibold text-[var(--foreground)]">{totalPages}</span>
              </p>
            </div>

            <ul className="space-y-2">
              {paginatedResults.map((result, index) => (
                <li key={`${result.doc.id}-${result.kind}`}>
                  <Link
                    href={`/biblia/${result.doc.book}/${result.doc.chapter}#v${result.doc.verse}`}
                    className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 transition hover:border-[var(--primary)] hover:bg-white"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--border)] bg-[#f7f2e8] px-1.5 font-semibold text-[var(--primary)]">
                        {start + index + 1}
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

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={clampedPage === 1}
                className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] transition enabled:hover:border-[var(--primary)] enabled:hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {pageButtons.map((page, index) => {
                  const previous = pageButtons[index - 1];
                  const showEllipsis = previous && page - previous > 1;

                  return (
                    <div key={page} className="flex items-center gap-1">
                      {showEllipsis ? <span className="px-1 text-xs text-[var(--muted)]">...</span> : null}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold transition ${
                          page === clampedPage
                            ? "bg-[var(--primary)] text-white"
                            : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={clampedPage === totalPages}
                className="rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] transition enabled:hover:border-[var(--primary)] enabled:hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Próxima
              </button>
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Nenhum resultado encontrado.</p>
        )
      ) : null}
    </section>
  );
}
