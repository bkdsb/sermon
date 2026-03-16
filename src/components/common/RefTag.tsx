"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBibleVersion } from "@/lib/bible/BibleVersionContext";
import { getVerse } from "@/lib/bible/getBible";
import type { BibleVerseId } from "@/lib/bible/types";

interface RefTagProps {
  verseRef: BibleVerseId;
}

export default function RefTag({ verseRef }: RefTagProps) {
  const router = useRouter();
  const { version } = useBibleVersion();

  const parsed = useMemo(() => {
    const [book, chapterRaw, verseRaw] = verseRef.split(".");
    const chapter = Number.parseInt(chapterRaw, 10);
    const verse = Number.parseInt(verseRaw, 10);
    return { book, chapter, verse };
  }, [verseRef]);

  const verseText = useMemo(() => getVerse(parsed.book, parsed.chapter, parsed.verse, version), [parsed, version]);

  const handleClick = () => {
    router.push(`/biblia/${parsed.book}/${parsed.chapter}#v${parsed.verse}`);
  };

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center rounded-lg border border-[var(--border)] bg-white px-2 py-0.5 text-xs font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] hover:bg-[#f7f2e8]"
      >
        [{verseRef}]
      </button>

      <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-left text-xs leading-relaxed text-[var(--foreground)] shadow-[0_10px_24px_rgba(24,31,42,0.14)] group-hover:block">
        {verseText ?? "Versículo não encontrado no dataset local."}
      </span>
    </span>
  );
}
