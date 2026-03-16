"use client";

import { useMemo, useRef, useState } from "react";
import { useBibleVersion } from "@/lib/bible/BibleVersionContext";
import { getAtTokenFromText } from "@/lib/editor/getAtToken";
import { useVerseSuggestions } from "@/lib/bible/useVerseSuggestions";

interface NoteEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
}

export default function NoteEditor({ value, onChange, placeholder }: NoteEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { version } = useBibleVersion();
  const [cursorPos, setCursorPos] = useState(0);

  const atToken = useMemo(() => getAtTokenFromText(value, cursorPos), [value, cursorPos]);
  const suggestions = useVerseSuggestions(atToken?.text ?? "", version);
  const shouldShowSuggestions = Boolean(atToken && suggestions.length > 0);

  const syncCursor = (nextPos: number | null) => {
    setCursorPos(nextPos ?? 0);
  };

  const replaceTokenWithReference = (verseId: string) => {
    if (!atToken) return;

    const replacement = `[${verseId}]`;
    const nextValue = value.slice(0, atToken.start) + replacement + value.slice(atToken.end);
    onChange(nextValue);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;

      const nextCursor = atToken.start + replacement.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(nextCursor, nextCursor);
      setCursorPos(nextCursor);
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          syncCursor(event.target.selectionStart);
        }}
        onClick={(event) => syncCursor(event.currentTarget.selectionStart)}
        onKeyUp={(event) => syncCursor(event.currentTarget.selectionStart)}
        onSelect={(event) => syncCursor(event.currentTarget.selectionStart)}
        onKeyDown={(event) => {
          if (!shouldShowSuggestions) return;

          if (event.key === "Enter") {
            event.preventDefault();
            replaceTokenWithReference(suggestions[0].id);
          }
        }}
        placeholder={placeholder ?? "Digite seu sermão aqui... use @rm 5:8 para sugerir referências."}
        className="min-h-[320px] w-full rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-7 shadow-sm outline-none transition focus:border-[var(--primary)]"
      />

      {shouldShowSuggestions ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_10px_24px_rgba(24,31,42,0.14)]">
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => replaceTokenWithReference(suggestion.id)}
                  className="flex w-full flex-col gap-1 border-b border-[var(--border)] px-3 py-2 text-left transition last:border-b-0 hover:bg-[#f2ecdf]"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">{suggestion.label}</span>
                  <span className="text-sm text-[var(--foreground)]">{suggestion.text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
