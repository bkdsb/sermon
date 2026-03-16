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
      className="scroll-mt-24 rounded-2xl border border-transparent px-3 py-3 transition hover:border-[var(--border)] hover:bg-white/75"
    >
      <div className="grid grid-cols-[2.25rem_1fr] gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-gradient-to-b from-white to-[#f3eee3] text-xs font-bold text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          {verseNumber}
        </span>

        <div>
          <p className="leading-8 text-[15px] text-[var(--foreground)]">{text}</p>

          {crossRefs.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[rgba(33,53,79,0.08)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                Cross refs
              </span>
              {crossRefs.map((crossRef) => (
                <RefTag key={`${id}-${crossRef}`} verseRef={crossRef} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
