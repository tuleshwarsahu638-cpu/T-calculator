import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Feature Flags — local-only for now.
//
// This app currently has no backend (see hooks/useAdminAuth.ts — Admin Mode
// itself is a local PIN, on purpose, so the app works identically offline,
// on a static host, or packaged as an Android APK). These flags are stored
// on-device the same way, via localStorage.
//
// They're written so a future backend can slot in without touching any
// screen that reads them: replace `readFlags()`/`persist()` below with a
// fetch to your backend (with this same shape as the response), and every
// caller of `useFeatureFlags()` keeps working unchanged.
// ---------------------------------------------------------------------------

export interface FeatureFlags {
  aiPlusEnabled: boolean;
  premiumEnabled: boolean;
  adsEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  experimentalToolsEnabled: boolean;
  // Online-only monetization (doc: "Free + Offline + Optional Internet
  // Monetization System") — all optional, never blocks offline use.
  rewardedAdForAiEnabled: boolean;
  aiDailyFreeLimit: number; // 0 = unlimited
  aiRewardPerAd: number; // extra questions granted per completed ad
  // Version management — informational only, never force-closes an old
  // version; just lets the admin nudge users to update when needed.
  minSupportedVersion: string; // empty = no enforcement
  updateMessage: string;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  aiPlusEnabled: true,
  premiumEnabled: false,
  adsEnabled: false,
  maintenanceMode: false,
  maintenanceMessage:
    "App abhi maintenance mein hai. Kripya kuch samay baad dobara try karein.",
  experimentalToolsEnabled: false,
  rewardedAdForAiEnabled: false,
  aiDailyFreeLimit: 0,
  aiRewardPerAd: 5,
  minSupportedVersion: "",
  updateMessage: "Ek naya version available hai. Behtar experience ke liye update karein.",
};

const STORAGE_KEY = "featureFlags";

function readFlags(): FeatureFlags {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_FLAGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_FLAGS;
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(readFlags);

  useEffect(() => {
    // Pick up changes made from another tab/window (e.g. Admin Panel open
    // in one tab, app in another).
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setFlags(readFlags());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateFlag = useCallback(
    <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
      setFlags((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  return { flags, updateFlag };
}
