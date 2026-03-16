export type BibleVerseId = `${string}.${number}.${number}`;
export type BibleVersion = "acf" | "ara";

export interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

export type Bible = BibleBook[];

export type CrossRefs = Record<BibleVerseId, BibleVerseId[]>;
