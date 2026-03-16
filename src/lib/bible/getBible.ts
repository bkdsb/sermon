import bibleData from "@/data/acf.json";
import bibleAraData from "@/data/ara.json";
import crossRefsData from "@/data/crossrefs.json";
import type { Bible, BibleBook, BibleVerseId, BibleVersion, CrossRefs } from "./types";

const bibles: Record<BibleVersion, Bible> = {
  acf: bibleData as Bible,
  ara: bibleAraData as Bible
};

const crossRefsByVersion: Record<BibleVersion, CrossRefs> = {
  // Mantido separado por versão para permitir regras diferentes no futuro.
  acf: crossRefsData as CrossRefs,
  ara: crossRefsData as CrossRefs
};

const normalizeBookKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

const booksByVersionAbbrev = Object.fromEntries(
  (Object.keys(bibles) as BibleVersion[]).map((version) => [
    version,
    new Map(bibles[version].map((book) => [normalizeBookKey(book.abbrev), book]))
  ])
) as Record<BibleVersion, Map<string, BibleBook>>;

export const DEFAULT_BIBLE_VERSION: BibleVersion = "acf";

export function toBibleVersion(input: string | null | undefined): BibleVersion {
  return input === "ara" ? "ara" : "acf";
}

export function getBible(version: BibleVersion = DEFAULT_BIBLE_VERSION): Bible {
  return bibles[version];
}

export function getBook(abbrev: string, version: BibleVersion = DEFAULT_BIBLE_VERSION): BibleBook | null {
  return booksByVersionAbbrev[version].get(normalizeBookKey(abbrev)) ?? null;
}

export function getChapter(abbrev: string, chapter: number, version: BibleVersion = DEFAULT_BIBLE_VERSION): string[] | null {
  if (!Number.isInteger(chapter) || chapter < 1) return null;

  const book = getBook(abbrev, version);
  if (!book) return null;

  return book.chapters[chapter - 1] ?? null;
}

export function getVerse(abbrev: string, chapter: number, verse: number, version: BibleVersion = DEFAULT_BIBLE_VERSION): string | null {
  if (!Number.isInteger(verse) || verse < 1) return null;

  const chapterData = getChapter(abbrev, chapter, version);
  if (!chapterData) return null;

  return chapterData[verse - 1] ?? null;
}

export function getCrossRefs(id: BibleVerseId, version: BibleVersion = DEFAULT_BIBLE_VERSION): BibleVerseId[] {
  return crossRefsByVersion[version][id] ?? [];
}
