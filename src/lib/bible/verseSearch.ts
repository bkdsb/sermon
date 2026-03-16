import Fuse from "fuse.js";
import { buildVerseIndex, type VerseDoc } from "./flattenVerses";

const index = buildVerseIndex();

const fuse = new Fuse(index, {
  includeScore: true,
  threshold: 0.36,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: "text", weight: 0.75 },
    { name: "id", weight: 0.15 },
    { name: "book", weight: 0.1 }
  ]
});

export function searchVersesFuzzy(query: string, limit = 8): VerseDoc[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  return fuse.search(normalizedQuery, { limit: Math.max(1, limit) }).map((result) => result.item);
}
