import { useMemo } from "react";
import { getVerse } from "./getBible";
import { parseRef } from "./parseReference";
import { searchVersesFuzzy } from "./verseSearch";
import type { BibleVerseId } from "./types";

export interface VerseSuggestion {
  id: BibleVerseId;
  label: string;
  text: string;
}

export function useVerseSuggestions(triggerText: string): VerseSuggestion[] {
  return useMemo(() => {
    const query = triggerText.trim();
    if (!query) return [];

    const parsed = parseRef(query);
    if (parsed) {
      const verseText = getVerse(parsed.book, parsed.chapter, parsed.verse);
      if (!verseText) return [];

      return [
        {
          id: parsed.id,
          label: `${parsed.book.toUpperCase()} ${parsed.chapter}:${parsed.verse}`,
          text: verseText
        }
      ];
    }

    return searchVersesFuzzy(query, 8).map((doc) => ({
      id: doc.id as BibleVerseId,
      label: `${doc.book.toUpperCase()} ${doc.chapter}:${doc.verse}`,
      text: doc.text
    }));
  }, [triggerText]);
}
