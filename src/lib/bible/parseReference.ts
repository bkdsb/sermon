import { DEFAULT_BIBLE_VERSION, getBible, getBook } from "./getBible";
import type { BibleVerseId, BibleVersion } from "./types";

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
  romanos: "rm",
  exodo: "ex",
  levitico: "lv",
  numeros: "nm",
  deuteronomio: "dt",
  atos: "at",
  acts: "at",
  apocalipse: "ap",
  revelation: "ap"
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const aliasMapByVersion = new Map<BibleVersion, Map<string, string>>();

function getAliasMap(version: BibleVersion) {
  const cached = aliasMapByVersion.get(version);
  if (cached) return cached;

  const map = new Map<string, string>();
  for (const book of getBible(version)) {
    map.set(normalize(book.abbrev), book.abbrev);
    map.set(normalize(book.name), book.abbrev);
  }

  for (const [alias, canonical] of Object.entries(BOOK_ALIASES)) {
    if (getBook(canonical, version)) {
      map.set(alias, canonical);
    }
  }

  aliasMapByVersion.set(version, map);
  return map;
}

const resolveBook = (bookToken: string, version: BibleVersion): string | null => {
  const normalized = normalize(bookToken);
  return getAliasMap(version).get(normalized) ?? null;
};

export function refToId(
  book: string,
  chapter: number,
  verse: number,
  version: BibleVersion = DEFAULT_BIBLE_VERSION
): BibleVerseId {
  const canonicalBook = resolveBook(book, version) ?? normalize(book);
  return `${canonicalBook}.${chapter}.${verse}` as BibleVerseId;
}

export function parseRef(rawRef: string, version: BibleVersion = DEFAULT_BIBLE_VERSION): ParsedRef | null {
  const cleaned = rawRef.trim().replace(/^@/, "").replace(/^\[/, "").replace(/\]$/, "");
  if (!cleaned) return null;
  const bookTokenPattern = "([0-9]?\\s*[A-Za-zÀ-ÿ]+(?:\\s+[A-Za-zÀ-ÿ]+)*)";

  const canonicalIdMatch = cleaned.match(/^([a-z0-9]+)\.(\d+)\.(\d+)$/i);
  if (canonicalIdMatch) {
    const [, bookRaw, chapterRaw, verseRaw] = canonicalIdMatch;
    const chapter = Number.parseInt(chapterRaw, 10);
    const verse = Number.parseInt(verseRaw, 10);
    const book = resolveBook(bookRaw, version);

    if (!book || chapter < 1 || verse < 1) return null;
    return { book, chapter, verse, id: refToId(book, chapter, verse, version) };
  }

  const match =
    cleaned.match(new RegExp(`^${bookTokenPattern}\\.(\\d+)\\.(\\d+)$`)) ??
    cleaned.match(new RegExp(`^${bookTokenPattern}\\s*(\\d+)\\s*[:.]\\s*(\\d+)$`)) ??
    cleaned.match(new RegExp(`^${bookTokenPattern}\\s+(\\d+)\\s+(\\d+)$`));

  if (!match) return null;

  const [, rawBook, chapterRaw, verseRaw] = match;
  const chapter = Number.parseInt(chapterRaw, 10);
  const verse = Number.parseInt(verseRaw, 10);

  if (!Number.isInteger(chapter) || chapter < 1 || !Number.isInteger(verse) || verse < 1) {
    return null;
  }

  const book = resolveBook(rawBook, version);
  if (!book) return null;

  return {
    book,
    chapter,
    verse,
    id: refToId(book, chapter, verse, version)
  };
}
