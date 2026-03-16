import { DEFAULT_BIBLE_VERSION, getBible } from "./getBible";
import type { BibleVersion } from "./types";

export type VerseDoc = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

const cachedByVersion = new Map<BibleVersion, VerseDoc[]>();

export function buildVerseIndex(version: BibleVersion = DEFAULT_BIBLE_VERSION): VerseDoc[] {
  const cached = cachedByVersion.get(version);
  if (cached) {
    return cached;
  }

  const docs: VerseDoc[] = [];

  for (const book of getBible(version)) {
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      const chapterNumber = chapterIndex + 1;

      for (let verseIndex = 0; verseIndex < chapter.length; verseIndex += 1) {
        const verseNumber = verseIndex + 1;
        docs.push({
          id: `${book.abbrev}.${chapterNumber}.${verseNumber}`,
          book: book.abbrev,
          chapter: chapterNumber,
          verse: verseNumber,
          text: chapter[verseIndex]
        });
      }
    }
  }

  cachedByVersion.set(version, docs);
  return docs;
}
