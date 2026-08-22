import { useEffect, useState } from "react";

const STORAGE_KEY = "scientific-mode";

export function useScientificMode() {
  const [scientificMode, setScientificMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(scientificMode));
    } catch (error) {
      console.error("Failed to save scientific mode:", error);
    }
  }, [scientificMode]);

  return { scientificMode, setScientificMode };
}
