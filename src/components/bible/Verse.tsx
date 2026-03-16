import RefTag from "@/components/common/RefTag";
import type { BibleVerseId } from "@/lib/bible/types";

interface VerseProps {
  id: BibleVerseId;
  verseNumber: number;
  text: string;
  crossRefs: BibleVerseId[];
}

export default function Verse({ id, verseNumber, text, crossRefs }: VerseProps) {
  return (
    <article
      id={`v${verseNumber}`}
      data-verse-number={verseNumber}
      data-verse-id={id}
      className="scroll-mt-24 rounded-xl border border-transparent px-3 py-2 hover:border-[var(--border)] hover:bg-white/60"
    >
      <p className="leading-7">
        <span className="mr-2 inline-flex min-w-6 rounded-md bg-black/5 px-1.5 py-0.5 text-center text-xs font-semibold text-[var(--muted)]">
          {verseNumber}
        </span>
        <span>{text}</span>
      </p>

      {crossRefs.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Cross refs</span>
          {crossRefs.map((crossRef) => (
            <RefTag key={`${id}-${crossRef}`} verseRef={crossRef} />
          ))}
        </div>
      ) : null}
    </article>
  );
}
