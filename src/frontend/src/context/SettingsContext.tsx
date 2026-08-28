import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DisplayTheme = "default" | "dark" | "light" | "amoled";
export type ButtonSize = "small" | "medium" | "large";

export interface AppSettings {
  displayTheme: DisplayTheme;
  buttonSize: ButtonSize;
  soundEnabled: boolean;
  volume: number;
  clickSound: boolean;
  resultSound: boolean;
  errorSound: boolean;
  soundTheme: string;
  saveHistory: boolean;
  hideOnBackground: boolean;
  animationsEnabled: boolean;
  batterySaver: boolean;
  highContrast: boolean;
  showHistory: boolean;
  showPercent: boolean;
  showMemory: boolean;
  hapticFeedback: boolean;
  decimalPlaces: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  displayTheme: "default",
  buttonSize: "small",
  soundEnabled: false,
  volume: 50,
  clickSound: true,
  resultSound: true,
  errorSound: true,
  soundTheme: "classic",
  saveHistory: true,
  hideOnBackground: false,
  animationsEnabled: true,
  batterySaver: false,
  highContrast: false,
  showHistory: true,
  showPercent: true,
  showMemory: true,
  hapticFeedback: true,
  decimalPlaces: 2,
};

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const merged = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      // v1.3.5 removed "xlarge" as a Button Size option — fall back to
      // "large" for anyone who had it saved from an older version.
      if (!["small", "medium", "large"].includes(merged.buttonSize)) {
        merged.buttonSize = "large";
      }
      return merged;
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme: typeof settings.displayTheme) => {
      root.classList.remove("dark", "light", "amoled");
      if (theme === "dark") {
        root.classList.add("dark");
        root.setAttribute("data-theme", "dark");
      } else if (theme === "light") {
        root.classList.add("light");
        root.setAttribute("data-theme", "light");
      } else if (theme === "amoled") {
        root.classList.add("dark", "amoled");
        root.setAttribute("data-theme", "amoled");
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        if (prefersDark) root.classList.add("dark");
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }
    };

    applyTheme(settings.displayTheme);

    root.setAttribute("data-high-contrast", String(settings.highContrast));
    root.setAttribute("data-animations", String(settings.animationsEnabled));
    root.setAttribute("data-battery-saver", String(settings.batterySaver));
    root.setAttribute("data-button-size", settings.buttonSize);

    if (settings.displayTheme === "default") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("default");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    return undefined;
  }, [
    settings.displayTheme,
    settings.highContrast,
    settings.animationsEnabled,
    settings.batterySaver,
    settings.buttonSize,
  ]);

  useEffect(() => {
    if (!settings.hideOnBackground) {
      document.documentElement.classList.remove("app-backgrounded");
      return undefined;
    }
    const handleVisibility = () => {
      document.documentElement.classList.toggle(
        "app-backgrounded",
        document.hidden,
      );
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.documentElement.classList.remove("app-backgrounded");
    };
  }, [settings.hideOnBackground]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem("appSettings", JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem("appSettings", JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
