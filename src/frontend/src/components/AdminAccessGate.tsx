import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Lock, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";

interface AdminAccessGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked: () => void;
}

type Step = "pin" | "setupPin" | "confirmReset";

export default function AdminAccessGate({
  open,
  onOpenChange,
  onUnlocked,
}: AdminAccessGateProps) {
  const auth = useAdminAuth();
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(
    auth.hasPinForDevice ? "pin" : "setupPin",
  );

  const reset = () => {
    setPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setStep(auth.hasPinForDevice ? "pin" : "setupPin");
  };

  const handlePinSubmit = async () => {
    const ok = await auth.unlockWithPin(pin);
    if (ok) {
      onOpenChange(false);
      onUnlocked();
      reset();
    } else if (auth.lockedUntil && auth.lockedUntil > Date.now()) {
      const seconds = Math.ceil((auth.lockedUntil - Date.now()) / 1000);
      setError(
        `Bahut zyada galat attempts. ${seconds} second baad dobara try karein.`,
      );
    } else {
      setError("Galat PIN. Dobara try karein.");
    }
  };

  const handleSetupPin = async () => {
    if (newPin.length < 4) {
      setError("PIN kam se kam 4 digit ka rakhein.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("Dono PIN match nahi hue.");
      return;
    }
    await auth.setupPin(newPin);
    auth.setSessionUnlocked(true);
    onOpenChange(false);
    onUnlocked();
    reset();
  };

  const handleReset = () => {
    auth.resetPin();
    setError(null);
    setStep("setupPin");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <ShieldCheck className="h-5 w-5" />
            Admin Access
          </DialogTitle>
        </DialogHeader>

        {step === "pin" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Apna admin PIN daalein
            </p>
            <Input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handlePinSubmit}>
                Unlock
              </Button>
              <Button
                variant="ghost"
                className="text-xs"
                onClick={() => setStep("confirmReset")}
              >
                PIN bhool gaye?
              </Button>
            </div>
          </div>
        )}

        {step === "confirmReset" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              PIN reset karne se purana PIN hamesha ke liye hat jayega aur
              aapko naya set karna hoga. Continue karein?
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={handleReset}>
                Reset karein
              </Button>
              <Button variant="ghost" onClick={() => setStep("pin")}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === "setupPin" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Is device ke liye ek admin PIN set karein (min 4 digit).
            </p>
            <Input
              type="password"
              inputMode="numeric"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Naya PIN"
              autoFocus
            />
            <Input
              type="password"
              inputMode="numeric"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="PIN dobara likhein"
              onKeyDown={(e) => e.key === "Enter" && handleSetupPin()}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleSetupPin}>
              Save PIN & Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
