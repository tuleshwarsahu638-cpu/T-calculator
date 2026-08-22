import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export interface UsePwaInstallReturn {
  canInstall: boolean;
  isIOS: boolean;
  showIOSGuide: boolean;
  isDismissed: boolean;
  isInstalled: boolean;
  handleInstall: () => Promise<void>;
  handleDismiss: () => void;
  setShowIOSGuide: (show: boolean) => void;
}

export function usePwaInstall(): UsePwaInstallReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isInstalled, setIsInstalled] = useState(false);

  const ios = isIOSDevice();
  const standalone = isStandalone();

  useEffect(() => {
    if (standalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [standalone]);

  // canInstall is true if we have a deferred prompt or iOS (regardless of dismissed state)
  // We always want to show install guidance so users can install via browser menu
  const canInstall = !standalone && !isInstalled && (!!deferredPrompt || ios);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (ios) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
  };

  return {
    canInstall,
    isIOS: ios,
    showIOSGuide,
    isDismissed,
    isInstalled,
    handleInstall,
    handleDismiss,
    setShowIOSGuide,
  };
}
