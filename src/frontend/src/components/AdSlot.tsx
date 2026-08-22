import { useState } from "react";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// Placed at the very bottom of a screen, below all calculator/AI content —
// never overlaps input, output, or answer areas. Only renders when:
//   1. The device is online (ads are an "internet available" feature only)
//   2. Admin has Ads turned on (Admin Panel → Features / Providers)
// Until a real ad SDK (AdMob etc.) is connected, this is an honest,
// clearly-labeled placeholder — not a fake/working ad.
export function AdSlot() {
  const { flags } = useFeatureFlags();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!flags.adsEnabled || !isOnline || dismissed) return null;

  return (
    <div className="w-full mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 flex items-center justify-between">
      <p className="text-[10px] text-muted-foreground">
        Ad space (placeholder — real ads provider connect hone tak khaali)
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[10px] text-muted-foreground hover:text-foreground ml-2 shrink-0"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
