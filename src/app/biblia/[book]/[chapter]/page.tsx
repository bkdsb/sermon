"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import BibleChapter from "@/components/bible/BibleChapter";
import BibleNavigator from "@/components/bible/BibleNavigator";
import BibleSearchBar from "@/components/bible/BibleSearchBar";
import BibleVersionSwitcher from "@/components/bible/BibleVersionSwitcher";
import { useBibleVersion } from "@/lib/bible/BibleVersionContext";
import { getBook, getChapter } from "@/lib/bible/getBible";

export default function BibleChapterPage() {
  const params = useParams<{ book: string; chapter: string }>();
  const { version } = useBibleVersion();

  const parsed = useMemo(() => {
    const book = params.book;
    const chapterNumber = Number.parseInt(params.chapter, 10);

    if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
      return null;
    }

    const bookData = getBook(book, version);
    const chapterData = getChapter(book, chapterNumber, version);

    if (!bookData || !chapterData) {
      return null;
    }

    return {
      book: bookData.abbrev,
      bookName: bookData.name,
      chapter: chapterNumber
    };
  }, [params.book, params.chapter, version]);

  if (!parsed) {
    return (
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_10px_24px_rgba(28,35,46,0.08)]">
        <p className="text-sm text-[var(--muted)]">Livro/capítulo inválido para a tradução selecionada.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_28px_rgba(28,35,46,0.08)]">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
        <h1 className="text-3xl font-bold text-[var(--primary)]">
          {parsed.bookName} {parsed.chapter}
        </h1>
        <BibleVersionSwitcher />
      </header>

      <div className="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-5">
          <BibleNavigator version={version} currentBook={parsed.book} currentChapter={parsed.chapter} />
          <BibleSearchBar version={version} />
        </aside>

        <div className="rounded-2xl border border-[var(--border)] bg-white/65 p-3 backdrop-blur-sm sm:p-4">
          <BibleChapter book={parsed.book} bookName={parsed.bookName} chapter={parsed.chapter} version={version} />
        </div>
      </div>
    </section>
  );
}
