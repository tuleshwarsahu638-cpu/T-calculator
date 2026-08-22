import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// AI+ usage limits + "watch an ad, get extra usage" reward flow.
//
// This is local-only and resets daily. It does not call any real ad
// network — there's a `simulate` flag so the UI can be honest with the
// user about what actually happens until a real ad SDK (per
// useMonetizationConfig's "rewardedAds" module) is wired in.
// ---------------------------------------------------------------------------

interface UsageState {
  date: string; // YYYY-MM-DD, resets when the date changes
  used: number;
  bonusRemaining: number;
}

const STORAGE_KEY = "aiUsageTracker";

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readUsage(): UsageState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && saved.date === todayKey()) return saved;
  } catch {}
  return { date: todayKey(), used: 0, bonusRemaining: 0 };
}

export function useAiUsageLimit(dailyFreeLimit: number, rewardAmount: number) {
  const [usage, setUsage] = useState<UsageState>(readUsage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
    } catch {}
  }, [usage]);

  const remaining = Math.max(0, dailyFreeLimit - usage.used) + usage.bonusRemaining;
  const limitReached = dailyFreeLimit > 0 && remaining <= 0;

  const recordUsage = useCallback(() => {
    setUsage((prev) => {
      const fresh = prev.date === todayKey() ? prev : { date: todayKey(), used: 0, bonusRemaining: 0 };
      if (fresh.used < dailyFreeLimit) {
        return { ...fresh, used: fresh.used + 1 };
      }
      return { ...fresh, bonusRemaining: Math.max(0, fresh.bonusRemaining - 1) };
    });
  }, [dailyFreeLimit]);

  // Called once a rewarded ad has actually finished (or, until a real ad
  // SDK is connected, once the simulated "ad" placeholder finishes).
  const grantReward = useCallback(() => {
    setUsage((prev) => {
      const fresh = prev.date === todayKey() ? prev : { date: todayKey(), used: 0, bonusRemaining: 0 };
      return { ...fresh, bonusRemaining: fresh.bonusRemaining + rewardAmount };
    });
  }, [rewardAmount]);

  return { usage, remaining, limitReached, recordUsage, grantReward };
}
