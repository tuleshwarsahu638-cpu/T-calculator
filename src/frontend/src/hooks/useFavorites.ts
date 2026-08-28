import { useCallback, useEffect, useState } from "react";

export interface FavoriteItem {
  id: string;
  expression: string;
  result: string;
  mode: string;
  savedAt: string;
}

const STORAGE_KEY = "calcFavorites";

function readFavorites(): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const persist = useCallback((items: FavoriteItem[]) => {
    setFavorites(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, []);

  const addFavorite = useCallback(
    (expression: string, result: string, mode: string) => {
      const item: FavoriteItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        expression,
        result,
        mode,
        savedAt: new Date().toISOString(),
      };
      persist([item, ...readFavorites()].slice(0, 100));
      return item.id;
    },
    [persist],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      persist(readFavorites().filter((f) => f.id !== id));
    },
    [persist],
  );

  const isFavorite = useCallback(
    (expression: string, result: string) =>
      favorites.some(
        (f) => f.expression === expression && f.result === result,
      ),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
