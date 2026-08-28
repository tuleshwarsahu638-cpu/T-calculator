import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type BoxType = "digit" | "operator" | "function" | "equals" | "display";

export interface BoxStyle {
  backgroundColor: string;
  textColor: string;
  outlineColor: string;
}

export interface ThumbLayerSettings {
  digit: BoxStyle;
  operator: BoxStyle;
  function: BoxStyle;
  equals: BoxStyle;
  display: BoxStyle;
  effect3d: boolean;
}

interface ThumbLayerSettingsContextValue {
  settings: ThumbLayerSettings;
  updateBoxStyle: (
    boxType: BoxType,
    property: keyof BoxStyle,
    value: string,
  ) => void;
  setEffect3d: (value: boolean) => void;
  resetSettings: () => void;
}

const _defaultBoxStyle: BoxStyle = {
  backgroundColor: "#1e293b",
  textColor: "#f1f5f9",
  outlineColor: "#334155",
};

const defaultSettings: ThumbLayerSettings = {
  digit: {
    backgroundColor: "#1e293b",
    textColor: "#f1f5f9",
    outlineColor: "#334155",
  },
  operator: {
    backgroundColor: "#f59e0b",
    textColor: "#1e293b",
    outlineColor: "#d97706",
  },
  function: {
    backgroundColor: "#0f172a",
    textColor: "#94a3b8",
    outlineColor: "#1e293b",
  },
  equals: {
    backgroundColor: "#10b981",
    textColor: "#ffffff",
    outlineColor: "#059669",
  },
  display: {
    backgroundColor: "#0f172a",
    textColor: "#f1f5f9",
    outlineColor: "#1e293b",
  },
  effect3d: true,
};

const STORAGE_KEY = "thumbLayerSettings";

const ThumbLayerSettingsContext =
  createContext<ThumbLayerSettingsContextValue | null>(null);

export function ThumbLayerSettingsProvider({
  children,
}: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThumbLayerSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateBoxStyle = (
    boxType: BoxType,
    property: keyof BoxStyle,
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [boxType]: {
        ...prev[boxType],
        [property]: value,
      },
    }));
  };

  const setEffect3d = (value: boolean) => {
    setSettings((prev) => ({ ...prev, effect3d: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ThumbLayerSettingsContext.Provider
      value={{ settings, updateBoxStyle, setEffect3d, resetSettings }}
    >
      {children}
    </ThumbLayerSettingsContext.Provider>
  );
}

export function useThumbLayerSettingsContext() {
  const ctx = useContext(ThumbLayerSettingsContext);
  if (!ctx)
    throw new Error(
      "useThumbLayerSettingsContext must be used within ThumbLayerSettingsProvider",
    );
  return ctx;
}
