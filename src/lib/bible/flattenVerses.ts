import { getBible } from "./getBible";

export type VerseDoc = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

let cachedIndex: VerseDoc[] | null = null;

export function buildVerseIndex(): VerseDoc[] {
  if (cachedIndex) {
    return cachedIndex;
  }

  const docs: VerseDoc[] = [];

  for (const book of getBible()) {
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

  cachedIndex = docs;
  return docs;
}
