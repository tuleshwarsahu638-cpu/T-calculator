import { useCallback, useState } from "react";
import type { StepLanguageMode } from "./stepFormat";

const STORAGE_KEY = "aiLanguageMode";

function read(): StepLanguageMode {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "hi" || saved === "en" || saved === "mix" ? saved : "mix";
}

export function useAiLanguageMode() {
  const [mode, setModeState] = useState<StepLanguageMode>(read);

  const setMode = useCallback((next: StepLanguageMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  return { mode, setMode };
}
