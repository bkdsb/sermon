import { getBible, getBook } from "./getBible";
import type { BibleVerseId } from "./types";

export interface ParsedRef {
  book: string;
  chapter: number;
  verse: number;
  id: BibleVerseId;
}

const BOOK_ALIASES: Record<string, string> = {
  gn: "gn",
  ge: "gn",
  gen: "gn",
  genesis: "gn",
  jo: "jo",
  joao: "jo",
  jn: "jo",
  joh: "jo",
  john: "jo",
  rm: "rm",
  rom: "rm",
  romans: "rm",
  romanos: "rm"
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const resolveBook = (bookToken: string): string | null => {
  const normalized = normalize(bookToken);

  const direct = getBook(normalized);
  if (direct) return direct.abbrev;

  const alias = BOOK_ALIASES[normalized];
  if (alias && getBook(alias)) return alias;

  for (const book of getBible()) {
    if (normalize(book.name) === normalized) return book.abbrev;
  }

  return null;
};

export function refToId(book: string, chapter: number, verse: number): BibleVerseId {
  const canonicalBook = resolveBook(book) ?? normalize(book);
  return `${canonicalBook}.${chapter}.${verse}` as BibleVerseId;
}

export function parseRef(rawRef: string): ParsedRef | null {
  const cleaned = rawRef.trim().replace(/^@/, "").replace(/^\[/, "").replace(/\]$/, "");
  if (!cleaned) return null;

  const match =
    cleaned.match(/^([0-9]?\s*[A-Za-zÀ-ÿ]+)\.(\d+)\.(\d+)$/) ??
    cleaned.match(/^([0-9]?\s*[A-Za-zÀ-ÿ]+)\s*(\d+)\s*[:.]\s*(\d+)$/) ??
    cleaned.match(/^([0-9]?\s*[A-Za-zÀ-ÿ]+)\s+(\d+)\s+(\d+)$/);

  if (!match) return null;

  const [, rawBook, chapterRaw, verseRaw] = match;
  const chapter = Number.parseInt(chapterRaw, 10);
  const verse = Number.parseInt(verseRaw, 10);

  if (!Number.isInteger(chapter) || chapter < 1 || !Number.isInteger(verse) || verse < 1) {
    return null;
  }

  const book = resolveBook(rawBook);
  if (!book) return null;

  return {
    book,
    chapter,
    verse,
    id: refToId(book, chapter, verse)
  };
}
