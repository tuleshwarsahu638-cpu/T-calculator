import { Download, X } from "lucide-react";
import { useState } from "react";
import { useAppUpdate } from "../hooks/useAppUpdate";

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useAppUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 shadow-lg animate-fade-up">
      <span>🎉 Naya update available hai!</span>
      <button
        type="button"
        onClick={applyUpdate}
        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
      >
        <Download className="h-3 w-3" />
        Update Karein
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
