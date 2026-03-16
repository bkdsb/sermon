"use client";

import { useMemo, useRef } from "react";
import Verse from "@/components/bible/Verse";
import { getChapter, getCrossRefs } from "@/lib/bible/getBible";
import type { BibleVerseId, BibleVersion } from "@/lib/bible/types";

interface BibleChapterProps {
  book: string;
  bookName: string;
  chapter: number;
  version: BibleVersion;
}

export default function BibleChapter({ book, bookName, chapter, version }: BibleChapterProps) {
  const chapterRef = useRef<HTMLElement>(null);
  const verses = getChapter(book, chapter, version);

  const verseItems = useMemo(() => {
    if (!verses) return [];

    return verses.map((text, index) => {
      const verseNumber = index + 1;
      const id = `${book}.${chapter}.${verseNumber}` as BibleVerseId;
      const crossRefs = getCrossRefs(id, version);

      return { id, verseNumber, text, crossRefs };
    });
  }, [book, chapter, verses, version]);

  if (!verses || verses.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
        Capítulo não encontrado.
      </div>
    );
  }

  const handleCopy = (event: React.ClipboardEvent<HTMLElement>) => {
    const root = chapterRef.current;
    if (!root) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;

    const verseNodes = Array.from(root.querySelectorAll<HTMLElement>("[data-verse-number]"));
    const selectedNumbers = verseNodes
      .filter((node) => {
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);

        const endsAfterStart = range.compareBoundaryPoints(Range.END_TO_START, nodeRange) > 0;
        const startsBeforeEnd = range.compareBoundaryPoints(Range.START_TO_END, nodeRange) < 0;
        return endsAfterStart && startsBeforeEnd;
      })
      .map((node) => Number.parseInt(node.dataset.verseNumber ?? "", 10))
      .filter((value) => Number.isInteger(value) && value > 0)
      .sort((a, b) => a - b);

    if (selectedNumbers.length === 0) return;

    const first = selectedNumbers[0];
    const last = selectedNumbers[selectedNumbers.length - 1];
    const reference = first === last ? `${bookName} ${chapter}:${first}` : `${bookName} ${chapter}:${first}-${last}`;

    event.preventDefault();
    event.clipboardData.setData("text/plain", `${reference}\n${selectedText}`);
  };

  return (
    <section ref={chapterRef} onCopy={handleCopy} className="space-y-1">
      {verseItems.map((verse) => (
        <Verse
          key={verse.id}
          id={verse.id}
          verseNumber={verse.verseNumber}
          text={verse.text}
          crossRefs={verse.crossRefs}
        />
      ))}
    </section>
  );
}
