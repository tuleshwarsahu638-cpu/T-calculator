import { X } from "lucide-react";
import { useState } from "react";
import { APP_VERSION } from "../config/appConfig";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// Simple semver-ish compare: "1.3.5" vs "1.4.0" — good enough for this
// app's own x.y.z versioning, not a full semver parser.
function isOlderVersion(current: string, minimum: string): boolean {
  const c = current.split(".").map(Number);
  const m = minimum.split(".").map(Number);
  for (let i = 0; i < Math.max(c.length, m.length); i++) {
    const cv = c[i] || 0;
    const mv = m[i] || 0;
    if (cv < mv) return true;
    if (cv > mv) return false;
  }
  return false;
}

export function VersionBanner() {
  const { flags } = useFeatureFlags();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow =
    isOnline &&
    !dismissed &&
    flags.minSupportedVersion.trim() !== "" &&
    isOlderVersion(APP_VERSION, flags.minSupportedVersion.trim());

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-card border border-primary/30 rounded-xl shadow-lg p-3 flex items-start gap-2">
        <div className="flex-1">
          <p className="text-xs font-medium text-foreground">
            {flags.updateMessage}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Current: v{APP_VERSION} · Recommended: v{flags.minSupportedVersion}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-muted-foreground hover:text-foreground shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
