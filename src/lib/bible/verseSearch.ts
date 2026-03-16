import Fuse from "fuse.js";
import { DEFAULT_BIBLE_VERSION } from "./getBible";
import { buildVerseIndex, type VerseDoc } from "./flattenVerses";
import type { BibleVersion } from "./types";

const fuseByVersion = new Map<BibleVersion, Fuse<VerseDoc>>();

function getFuse(version: BibleVersion) {
  const existing = fuseByVersion.get(version);
  if (existing) return existing;

  const fuse = new Fuse(buildVerseIndex(version), {
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

  fuseByVersion.set(version, fuse);
  return fuse;
}

export function searchVersesFuzzy(query: string, limit = 8, version: BibleVersion = DEFAULT_BIBLE_VERSION): VerseDoc[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  return getFuse(version)
    .search(normalizedQuery, { limit: Math.max(1, limit) })
    .map((result) => result.item);
}
