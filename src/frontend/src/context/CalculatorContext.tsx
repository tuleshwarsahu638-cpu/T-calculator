import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CalculatorTab } from "../components/Navigation";

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  mode: CalculatorTab;
}

export interface CalculatorSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
  decimalPlaces: number;
  angleUnit: "deg" | "rad";
}

interface CalculatorContextValue {
  activeTab: CalculatorTab;
  setActiveTab: (tab: CalculatorTab) => void;
  history: HistoryEntry[];
  addHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  deleteHistoryEntry: (id: string) => void;
  settings: CalculatorSettings;
  updateSetting: <K extends keyof CalculatorSettings>(
    key: K,
    value: CalculatorSettings[K],
  ) => void;
}

const DEFAULT_SETTINGS: CalculatorSettings = {
  darkMode: false,
  soundEnabled: false,
  hapticFeedback: true,
  decimalPlaces: 8,
  angleUnit: "deg",
};

function loadSettings(): CalculatorSettings {
  try {
    const saved = localStorage.getItem("calcSettings");
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem("calcHistory");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

const CalculatorContext = createContext<CalculatorContextValue | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("tab") as CalculatorTab | null;
      const valid: CalculatorTab[] = [
        "basic", "scientific", "programmer", "finance", "tools",
        "graph", "ai", "datetime", "health", "education", "engineering",
      ];
      if (requested && valid.includes(requested)) return requested;
    } catch {
      /* ignore */
    }
    return "basic";
  });
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [settings, setSettings] = useState<CalculatorSettings>(loadSettings);

  // Sync dark mode with document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("calcHistory", JSON.stringify(history));
    } catch {}
  }, [history]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem("calcSettings", JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const addHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev];
      if (next.length > 100) next.pop();
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const deleteHistoryEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateSetting = useCallback(
    <K extends keyof CalculatorSettings>(
      key: K,
      value: CalculatorSettings[K],
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <CalculatorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        history,
        addHistory,
        clearHistory,
        deleteHistoryEntry,
        settings,
        updateSetting,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const ctx = useContext(CalculatorContext);
  if (!ctx)
    throw new Error(
      "useCalculatorContext must be used within CalculatorProvider",
    );
  return ctx;
}
