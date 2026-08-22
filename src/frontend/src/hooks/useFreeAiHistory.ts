import { useCallback, useEffect, useState } from "react";
import { guessCategory } from "../lib/guessCategory";

export interface FreeAiHistoryItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  pinned: boolean;
  savedAt: string;
}

const STORAGE_KEY = "freeAiHistory";
// Keep this list lightweight — only the last 60 questions are kept, and we
// only ever store short text (never images/audio), so this stays small.
const MAX_ITEMS = 60;

function readHistory(): FreeAiHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFreeAiHistory() {
  const [items, setItems] = useState<FreeAiHistoryItem[]>([]);

  useEffect(() => {
    setItems(readHistory());
  }, []);

  const persist = useCallback((next: FreeAiHistoryItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addEntry = useCallback(
    (question: string, answer: string) => {
      const entry: FreeAiHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        question,
        answer,
        category: guessCategory(question),
        pinned: false,
        savedAt: new Date().toISOString(),
      };
      const current = readHistory();
      // Pinned items are never trimmed off the end; only unpinned ones are.
      const pinned = current.filter((i) => i.pinned);
      const unpinned = current.filter((i) => !i.pinned);
      const nextUnpinned = [entry, ...unpinned].slice(
        0,
        Math.max(0, MAX_ITEMS - pinned.length),
      );
      persist([...pinned, ...nextUnpinned].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)));
      return entry.id;
    },
    [persist],
  );

  const togglePin = useCallback(
    (id: string) => {
      persist(
        readHistory().map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)),
      );
    },
    [persist],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(readHistory().filter((i) => i.id !== id));
    },
    [persist],
  );

  const clearHistory = useCallback(() => {
    // Pinned items survive a "clear" — only unpinned entries are removed.
    persist(readHistory().filter((i) => i.pinned));
  }, [persist]);

  return { items, addEntry, togglePin, deleteEntry, clearHistory };
}
