"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import BibleChapter from "@/components/bible/BibleChapter";
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
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <p className="text-sm text-[var(--muted)]">Livro/capítulo inválido para a tradução selecionada.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">
          {parsed.bookName} {parsed.chapter}
        </h1>
        <BibleVersionSwitcher />
      </header>

      <BibleSearchBar version={version} />

      <BibleChapter book={parsed.book} chapter={parsed.chapter} version={version} />
    </section>
  );
}
