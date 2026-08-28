import { useCallback, useState } from "react";

export interface ConversionHistoryItem {
  id: string;
  category: string;
  fromLabel: string;
  toLabel: string;
  inputValue: string;
  result: string;
  savedAt: string;
}

const STORAGE_KEY = "unitConversionHistory";
const MAX_ITEMS = 30;

function read(): ConversionHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useConversionHistory() {
  const [items, setItems] = useState<ConversionHistoryItem[]>(read);

  const persist = useCallback((next: ConversionHistoryItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addEntry = useCallback(
    (entry: Omit<ConversionHistoryItem, "id" | "savedAt">) => {
      const current = read();
      // Skip if it's an exact repeat of the most recent entry (typing
      // triggers this on every keystroke otherwise).
      const last = current[0];
      if (
        last &&
        last.category === entry.category &&
        last.fromLabel === entry.fromLabel &&
        last.toLabel === entry.toLabel &&
        last.inputValue === entry.inputValue
      ) {
        return;
      }
      const next = [
        { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, savedAt: new Date().toISOString() },
        ...current,
      ].slice(0, MAX_ITEMS);
      persist(next);
    },
    [persist],
  );

  const clearHistory = useCallback(() => persist([]), [persist]);

  return { items, addEntry, clearHistory };
}
