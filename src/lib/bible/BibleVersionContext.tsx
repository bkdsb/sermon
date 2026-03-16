"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_BIBLE_VERSION, toBibleVersion } from "@/lib/bible/getBible";
import type { BibleVersion } from "@/lib/bible/types";

const STORAGE_KEY = "sermon:bible:version";

interface BibleVersionContextValue {
  version: BibleVersion;
  setVersion: (nextVersion: BibleVersion) => void;
}

const BibleVersionContext = createContext<BibleVersionContextValue | null>(null);

export function BibleVersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersionState] = useState<BibleVersion>(DEFAULT_BIBLE_VERSION);

  useEffect(() => {
    try {
      const storedVersion = window.localStorage.getItem(STORAGE_KEY);
      if (storedVersion) {
        setVersionState(toBibleVersion(storedVersion));
      }
    } catch (error) {
      console.error("Failed to read preferred Bible version", error);
    }
  }, []);

  const setVersion = (nextVersion: BibleVersion) => {
    setVersionState(nextVersion);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextVersion);
    } catch (error) {
      console.error("Failed to persist preferred Bible version", error);
    }
  };

  const contextValue = useMemo(
    () => ({
      version,
      setVersion
    }),
    [version]
  );

  return <BibleVersionContext.Provider value={contextValue}>{children}</BibleVersionContext.Provider>;
}

export function useBibleVersion() {
  const context = useContext(BibleVersionContext);
  if (!context) {
    throw new Error("useBibleVersion must be used within BibleVersionProvider.");
  }

  return context;
}
