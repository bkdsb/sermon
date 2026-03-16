"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBible, getBook, getChapter } from "@/lib/bible/getBible";
import type { BibleVersion } from "@/lib/bible/types";

const OT_BOOKS_COUNT = 39;

type Testament = "AT" | "NT";

interface BibleNavigatorProps {
  version: BibleVersion;
  currentBook: string;
  currentChapter: number;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function BibleNavigator({ version, currentBook, currentChapter }: BibleNavigatorProps) {
  const router = useRouter();
  const bible = useMemo(() => getBible(version), [version]);

  const currentBookIndex = useMemo(
    () => bible.findIndex((book) => book.abbrev === currentBook),
    [bible, currentBook]
  );

  const [activeTestament, setActiveTestament] = useState<Testament>(
    currentBookIndex >= OT_BOOKS_COUNT ? "NT" : "AT"
  );
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [bookFilter, setBookFilter] = useState("");
  const [selectedVerse, setSelectedVerse] = useState("");

  useEffect(() => {
    setActiveTestament(currentBookIndex >= OT_BOOKS_COUNT ? "NT" : "AT");
    setSelectedVerse("");
  }, [currentBookIndex, currentBook, currentChapter]);

  const filteredBooks = useMemo(() => {
    const query = normalize(bookFilter);

    return bible.filter((book, index) => {
      const isOT = index < OT_BOOKS_COUNT;
      const matchesTestament = activeTestament === "AT" ? isOT : !isOT;
      if (!matchesTestament) return false;

      if (!query) return true;

      const byName = normalize(book.name).includes(query);
      const byAbbrev = normalize(book.abbrev).includes(query);
      return byName || byAbbrev;
    });
  }, [activeTestament, bible, bookFilter]);

  const chapterCount = useMemo(() => {
    const book = getBook(currentBook, version);
    return book?.chapters.length ?? 0;
  }, [currentBook, version]);

  const verseCount = useMemo(() => {
    const chapter = getChapter(currentBook, currentChapter, version);
    return chapter?.length ?? 0;
  }, [currentBook, currentChapter, version]);

  const handleBookSelect = (abbrev: string) => {
    setIsBooksOpen(false);
    router.push(`/biblia/${abbrev}/1`);
  };

  const handleChapterSelect = (chapterValue: string) => {
    const chapter = Number.parseInt(chapterValue, 10);
    if (!Number.isInteger(chapter) || chapter < 1) return;

    router.push(`/biblia/${currentBook}/${chapter}`);
  };

  const handleVerseSelect = (verseValue: string) => {
    setSelectedVerse(verseValue);

    const verse = Number.parseInt(verseValue, 10);
    if (!Number.isInteger(verse) || verse < 1) return;

    router.push(`/biblia/${currentBook}/${currentChapter}#v${verse}`);
  };

  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white/75 p-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-[var(--border)] bg-white p-1">
          {(["AT", "NT"] as Testament[]).map((testament) => {
            const active = activeTestament === testament;
            return (
              <button
                key={testament}
                type="button"
                onClick={() => {
                  setActiveTestament(testament);
                  setIsBooksOpen(true);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-[var(--primary)] text-white shadow-sm" : "text-[var(--muted)] hover:bg-[#f2ecdf]"
                }`}
              >
                {testament}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsBooksOpen((open) => !open)}
          className="rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
        >
          {isBooksOpen ? "Fechar livros" : "Livros"}
        </button>

        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Capítulo
          <select
            value={String(currentChapter)}
            onChange={(event) => handleChapterSelect(event.target.value)}
            className="ml-2 rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            {Array.from({ length: chapterCount }, (_, index) => index + 1).map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </label>

        <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Versículo
          <select
            value={selectedVerse}
            onChange={(event) => handleVerseSelect(event.target.value)}
            className="ml-2 rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
          >
            <option value="">Selecionar</option>
            {Array.from({ length: verseCount }, (_, index) => index + 1).map((verse) => (
              <option key={verse} value={verse}>
                {verse}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isBooksOpen ? (
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
          <input
            value={bookFilter}
            onChange={(event) => setBookFilter(event.target.value)}
            placeholder="Filtrar livro..."
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
          />

          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 md:grid-cols-6">
            {filteredBooks.map((book) => {
              const isCurrent = book.abbrev === currentBook;
              return (
                <button
                  key={book.abbrev}
                  type="button"
                  onClick={() => handleBookSelect(book.abbrev)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                    isCurrent
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {book.abbrev.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
