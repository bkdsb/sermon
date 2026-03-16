import bibleData from "@/data/acf.json";
import crossRefsData from "@/data/crossrefs.json";
import type { Bible, BibleBook, BibleVerseId, CrossRefs } from "./types";

const bible = bibleData as Bible;
const crossRefs = crossRefsData as CrossRefs;

const normalizeBookKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

const booksByAbbrev = new Map(bible.map((book) => [normalizeBookKey(book.abbrev), book]));

export function getBible(): Bible {
  return bible;
}

export function getBook(abbrev: string): BibleBook | null {
  return booksByAbbrev.get(normalizeBookKey(abbrev)) ?? null;
}

export function getChapter(abbrev: string, chapter: number): string[] | null {
  if (!Number.isInteger(chapter) || chapter < 1) return null;

  const book = getBook(abbrev);
  if (!book) return null;

  return book.chapters[chapter - 1] ?? null;
}

export function getVerse(abbrev: string, chapter: number, verse: number): string | null {
  if (!Number.isInteger(verse) || verse < 1) return null;

  const chapterData = getChapter(abbrev, chapter);
  if (!chapterData) return null;

  return chapterData[verse - 1] ?? null;
}

export function getCrossRefs(id: BibleVerseId): BibleVerseId[] {
  return crossRefs[id] ?? [];
}
