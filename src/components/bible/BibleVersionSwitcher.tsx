"use client";

import { useBibleVersion } from "@/lib/bible/BibleVersionContext";
import type { BibleVersion } from "@/lib/bible/types";

const OPTIONS: Array<{ value: BibleVersion; label: string }> = [
  { value: "acf", label: "ACF" },
  { value: "ara", label: "ARA" }
];

interface BibleVersionSwitcherProps {
  compact?: boolean;
}

export default function BibleVersionSwitcher({ compact = false }: BibleVersionSwitcherProps) {
  const { version, setVersion } = useBibleVersion();

  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
      {!compact ? "Tradução" : null}
      <select
        value={version}
        onChange={(event) => setVersion(event.target.value as BibleVersion)}
        className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
