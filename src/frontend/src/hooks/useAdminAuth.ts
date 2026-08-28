import { useCallback, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Admin Auth — pure local PIN system. No backend, no network, no Internet
// Identity dependency. This guarantees Admin Mode (and the app as a whole)
// works the same way whether it's running on Caffeine's dev server, a free
// static host, or packaged as an Android APK.
// ---------------------------------------------------------------------------

const PIN_KEY = "adminPinHash";
const ATTEMPTS_KEY = "adminPinAttempts";
const LOCKOUT_KEY = "adminPinLockoutUntil";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minute lockout after 5 wrong tries

async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder().encode(`calcura-admin:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function logAudit(event: string) {
  try {
    const log = JSON.parse(localStorage.getItem("adminAuditLog") || "[]");
    log.unshift({ event, time: new Date().toISOString() });
    localStorage.setItem("adminAuditLog", JSON.stringify(log.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export function useAdminAuth() {
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [hasPinForDevice, setHasPinForDevice] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    setHasPinForDevice(!!localStorage.getItem(PIN_KEY));
    const until = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
    if (until > Date.now()) setLockedUntil(until);
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_KEY, hash);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    setHasPinForDevice(true);
    logAudit("PIN set up");
  }, []);

  const unlockWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const until = Number(localStorage.getItem(LOCKOUT_KEY) || 0);
    if (until > Date.now()) {
      setLockedUntil(until);
      return false;
    }

    const stored = localStorage.getItem(PIN_KEY);
    if (!stored) return false;
    const attempt = await hashPin(pin);
    const ok = attempt === stored;

    if (ok) {
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      setLockedUntil(null);
      setSessionUnlocked(true);
      try {
        sessionStorage.setItem("adminSessionBypass", "1");
      } catch {}
      logAudit("Unlocked successfully");
    } else {
      const attempts = Number(localStorage.getItem(ATTEMPTS_KEY) || 0) + 1;
      localStorage.setItem(ATTEMPTS_KEY, String(attempts));
      logAudit(`Failed PIN attempt (${attempts}/${MAX_ATTEMPTS})`);
      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_MS;
        localStorage.setItem(LOCKOUT_KEY, String(lockUntil));
        localStorage.removeItem(ATTEMPTS_KEY);
        setLockedUntil(lockUntil);
        logAudit("Locked out for 1 minute (too many failed attempts)");
      }
    }
    return ok;
  }, []);

  const resetPin = useCallback(() => {
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    setHasPinForDevice(false);
    setSessionUnlocked(false);
    setLockedUntil(null);
    logAudit("PIN reset");
  }, []);

  const lock = useCallback(() => {
    setSessionUnlocked(false);
    logAudit("Locked");
  }, []);

  return {
    sessionUnlocked,
    hasPinForDevice,
    lockedUntil,
    setupPin,
    unlockWithPin,
    resetPin,
    setSessionUnlocked,
    lock,
  };
}
