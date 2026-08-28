import { useCallback, useState } from "react";

export interface UnitFavorite {
  id: string;
  category: string;
  fromUnit: string;
  toUnit: string;
  label: string;
}

const STORAGE_KEY = "unitFavorites";

function read(): UnitFavorite[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useUnitFavorites() {
  const [favorites, setFavorites] = useState<UnitFavorite[]>(read);

  const persist = useCallback((next: UnitFavorite[]) => {
    setFavorites(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const isFavorite = useCallback(
    (category: string, fromUnit: string, toUnit: string) =>
      favorites.some(
        (f) => f.category === category && f.fromUnit === fromUnit && f.toUnit === toUnit,
      ),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (fav: Omit<UnitFavorite, "id">) => {
      const existing = read();
      const match = existing.find(
        (f) =>
          f.category === fav.category &&
          f.fromUnit === fav.fromUnit &&
          f.toUnit === fav.toUnit,
      );
      if (match) {
        persist(existing.filter((f) => f.id !== match.id));
      } else {
        persist([
          { ...fav, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
          ...existing,
        ].slice(0, 20));
      }
    },
    [persist],
  );

  return { favorites, isFavorite, toggleFavorite };
}
