import Verse from "@/components/bible/Verse";
import { getChapter, getCrossRefs } from "@/lib/bible/getBible";
import type { BibleVerseId, BibleVersion } from "@/lib/bible/types";

interface BibleChapterProps {
  book: string;
  chapter: number;
  version: BibleVersion;
}

export default function BibleChapter({ book, chapter, version }: BibleChapterProps) {
  const verses = getChapter(book, chapter, version);

  if (!verses || verses.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--muted)]">
        Capítulo não encontrado.
      </div>
    );
  }

  return (
    <section className="space-y-1">
      {verses.map((text, index) => {
        const verseNumber = index + 1;
        const id = `${book}.${chapter}.${verseNumber}` as BibleVerseId;
        const crossRefs = getCrossRefs(id, version);

        return <Verse key={id} id={id} verseNumber={verseNumber} text={text} crossRefs={crossRefs} />;
      })}
    </section>
  );
}
