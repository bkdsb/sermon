import Fuse from "fuse.js";
import { DEFAULT_BIBLE_VERSION } from "./getBible";
import { buildVerseIndex, type VerseDoc } from "./flattenVerses";
import { parseRef } from "./parseReference";
import type { BibleVersion } from "./types";

const fuseByVersion = new Map<BibleVersion, Fuse<VerseDoc>>();
const docsByVersion = new Map<BibleVersion, VerseDoc[]>();
const orderByVerseIdByVersion = new Map<BibleVersion, Map<string, number>>();
const normalizedTextByVersion = new Map<BibleVersion, string[]>();

export type VerseSearchMatchKind = "reference_exact" | "reference_neighbor" | "text_exact" | "text_fuzzy";

export interface VerseSearchResult {
  doc: VerseDoc;
  kind: VerseSearchMatchKind;
  score: number;
  order: number;
}

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

function getDocs(version: BibleVersion) {
  const existing = docsByVersion.get(version);
  if (existing) return existing;

  const docs = buildVerseIndex(version);
  docsByVersion.set(version, docs);
  return docs;
}

function getOrderByVerseId(version: BibleVersion) {
  const existing = orderByVerseIdByVersion.get(version);
  if (existing) return existing;

  const map = new Map<string, number>();
  getDocs(version).forEach((doc, index) => {
    map.set(doc.id, index);
  });
  orderByVerseIdByVersion.set(version, map);
  return map;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNormalizedTexts(version: BibleVersion) {
  const existing = normalizedTextByVersion.get(version);
  if (existing) return existing;

  const normalized = getDocs(version).map((doc) => normalizeText(doc.text));
  normalizedTextByVersion.set(version, normalized);
  return normalized;
}

export function searchVersesFuzzy(query: string, limit = 8, version: BibleVersion = DEFAULT_BIBLE_VERSION): VerseDoc[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  return getFuse(version)
    .search(normalizedQuery, { limit: Math.max(1, limit) })
    .map((result) => result.item);
}

export function searchVersesSmart(
  query: string,
  limit = 20,
  version: BibleVersion = DEFAULT_BIBLE_VERSION
): VerseSearchResult[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const docs = getDocs(version);
  const orderByVerseId = getOrderByVerseId(version);
  const resultsMap = new Map<string, VerseSearchResult>();

  const rankForKind: Record<VerseSearchMatchKind, number> = {
    reference_exact: 0,
    reference_neighbor: 1,
    text_exact: 2,
    text_fuzzy: 3
  };

  const upsert = (doc: VerseDoc, kind: VerseSearchMatchKind, score: number) => {
    const order = orderByVerseId.get(doc.id);
    if (order === undefined) return;

    const incoming: VerseSearchResult = { doc, kind, score, order };
    const existing = resultsMap.get(doc.id);
    if (!existing) {
      resultsMap.set(doc.id, incoming);
      return;
    }

    const existingRank = rankForKind[existing.kind];
    const incomingRank = rankForKind[incoming.kind];

    if (
      incomingRank < existingRank ||
      (incomingRank === existingRank && (incoming.score < existing.score || incoming.order < existing.order))
    ) {
      resultsMap.set(doc.id, incoming);
    }
  };

  const parsedRef = parseRef(normalizedQuery, version);
  if (parsedRef) {
    const exactOrder = orderByVerseId.get(parsedRef.id);
    const exactDoc = exactOrder !== undefined ? docs[exactOrder] : undefined;
    if (exactDoc) {
      upsert(exactDoc, "reference_exact", 0);
    }

    for (let offset = 1; offset <= 2; offset += 1) {
      const prevId = `${parsedRef.book}.${parsedRef.chapter}.${parsedRef.verse - offset}`;
      const nextId = `${parsedRef.book}.${parsedRef.chapter}.${parsedRef.verse + offset}`;

      const prevOrder = orderByVerseId.get(prevId);
      const nextOrder = orderByVerseId.get(nextId);

      const prevDoc = prevOrder !== undefined ? docs[prevOrder] : undefined;
      const nextDoc = nextOrder !== undefined ? docs[nextOrder] : undefined;
      if (prevDoc) upsert(prevDoc, "reference_neighbor", offset);
      if (nextDoc) upsert(nextDoc, "reference_neighbor", offset);
    }
  }

  const normalizedPhrase = normalizeText(normalizedQuery);
  if (normalizedPhrase.length >= 2) {
    const normalizedTexts = getNormalizedTexts(version);
    normalizedTexts.forEach((normalizedVerse, index) => {
      const phraseIndex = normalizedVerse.indexOf(normalizedPhrase);
      if (phraseIndex >= 0) {
        upsert(docs[index], "text_exact", phraseIndex);
      }
    });
  }

  const fuzzyLimit = Math.max(limit * 4, 30);
  getFuse(version)
    .search(normalizedQuery, { limit: fuzzyLimit })
    .forEach((result, index) => {
      upsert(result.item, "text_fuzzy", (result.score ?? 1) + index / 10000);
    });

  return [...resultsMap.values()]
    .sort((a, b) => {
      const rankDiff = rankForKind[a.kind] - rankForKind[b.kind];
      if (rankDiff !== 0) return rankDiff;

      const scoreDiff = a.score - b.score;
      if (scoreDiff !== 0) return scoreDiff;

      return a.order - b.order;
    })
    .slice(0, Math.max(1, limit));
}
