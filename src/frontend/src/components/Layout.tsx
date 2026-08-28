import { Download } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { isIOSDevice, usePwaInstall } from "../hooks/usePwaInstall";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { canInstall, isInstalled, handleInstall, setShowIOSGuide } =
    usePwaInstall();

  const showStickyInstall = useMemo(
    () => canInstall && !isInstalled,
    [canInstall, isInstalled],
  );

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto">
        {children}
      </main>

      {/* Persistent Sticky Orange Install Bar */}
      {showStickyInstall && (
        <div className="sticky bottom-0 left-0 right-0 z-50 bg-warning border-t border-warning/30 install-bar-pulse">
          <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight">
                Phone में Install करें
              </p>
              <p className="text-white/80 text-xs leading-tight truncate">
                {isIOSDevice()
                  ? "Safari → Share → Add to Home Screen"
                  : "Home Screen पर App icon आएगा"}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (isIOSDevice()) {
                  setShowIOSGuide(true);
                } else {
                  await handleInstall();
                }
              }}
              className="bg-white text-amber-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-white/90 active:scale-95 transition-all flex-shrink-0 shadow-lg"
              data-ocid="install.primary_button"
            >
              Install
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
