import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Fingerprint, Lock, Shield, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const PIN_KEY = "calcpro_pin";
const LOCK_ENABLED_KEY = "calcpro_lock_enabled";

export default function SecuritySettings() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [lockEnabled, setLockEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [fingerprintSupported, setFingerprintSupported] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PIN_KEY);
      setHasPin(!!saved);
      const enabled = localStorage.getItem(LOCK_ENABLED_KEY);
      setLockEnabled(enabled === "true");
    } catch {
      /* ignore */
    }

    // Check WebAuthn / fingerprint support
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setFingerprintSupported(true);
    }
  }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3000);
  };
  const showErr = (err: string) => {
    setError(err);
    setMessage(null);
    setTimeout(() => setError(null), 3000);
  };

  const setupPin = () => {
    if (pin.length < 4) {
      showErr("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      showErr("PINs do not match");
      return;
    }
    try {
      localStorage.setItem(PIN_KEY, pin);
      setHasPin(true);
      setShowSetup(false);
      setPin("");
      setConfirmPin("");
      showMsg("PIN set successfully");
    } catch {
      showErr("Could not save PIN");
    }
  };

  const changePin = () => {
    try {
      const saved = localStorage.getItem(PIN_KEY);
      if (saved !== currentPin) {
        showErr("Current PIN is incorrect");
        return;
      }
      if (pin.length < 4) {
        showErr("New PIN must be at least 4 digits");
        return;
      }
      if (pin !== confirmPin) {
        showErr("New PINs do not match");
        return;
      }
      localStorage.setItem(PIN_KEY, pin);
      setShowChange(false);
      setCurrentPin("");
      setPin("");
      setConfirmPin("");
      showMsg("PIN changed successfully");
    } catch {
      showErr("Could not change PIN");
    }
  };

  const removePin = () => {
    if (!confirm("Remove PIN lock? This will disable app lock.")) return;
    try {
      localStorage.removeItem(PIN_KEY);
      localStorage.removeItem(LOCK_ENABLED_KEY);
      setHasPin(false);
      setLockEnabled(false);
      showMsg("PIN removed");
    } catch {
      showErr("Could not remove PIN");
    }
  };

  const toggleLock = (enabled: boolean) => {
    if (enabled && !hasPin) {
      showErr("Set a PIN first");
      return;
    }
    try {
      localStorage.setItem(LOCK_ENABLED_KEY, String(enabled));
      setLockEnabled(enabled);
      showMsg(enabled ? "App lock enabled" : "App lock disabled");
    } catch {
      showErr("Could not update lock setting");
    }
  };

  const requestFingerprint = async () => {
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "TCalc AI" },
          user: { id: new Uint8Array(16), name: "user", displayName: "User" },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        },
      });
      if (cred) showMsg("Fingerprint registered successfully");
    } catch {
      showErr("Fingerprint registration failed or cancelled");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
          <p className="text-xs text-muted-foreground">
            PIN lock and biometric protection
          </p>
        </div>
      </div>

      {/* App Lock Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">App Lock</p>
              <p className="text-xs text-muted-foreground">
                Require PIN to open app
              </p>
            </div>
          </div>
          <Switch
            checked={lockEnabled}
            onCheckedChange={toggleLock}
            data-ocid="security.lock.toggle"
          />
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className="bg-success/10 border border-success/30 rounded-xl p-3 text-xs text-success font-medium"
          data-ocid="security.success_state"
        >
          {message}
        </div>
      )}
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-xs text-destructive"
          data-ocid="security.error_state"
        >
          {error}
        </div>
      )}

      {/* PIN Status */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">PIN Status</p>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hasPin ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
          >
            {hasPin ? "Set" : "Not Set"}
          </span>
        </div>

        {!hasPin && !showSetup && (
          <Button
            type="button"
            onClick={() => setShowSetup(true)}
            className="w-full text-xs"
            data-ocid="security.pin.setup.button"
          >
            Set Up PIN
          </Button>
        )}

        {hasPin && !showChange && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setShowChange(true)}
              variant="outline"
              className="flex-1 text-xs"
              data-ocid="security.pin.change.button"
            >
              Change PIN
            </Button>
            <Button
              type="button"
              onClick={removePin}
              variant="outline"
              className="flex-1 text-xs text-destructive hover:bg-destructive/10"
              data-ocid="security.pin.remove.button"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Remove
            </Button>
          </div>
        )}
      </div>

      {/* Setup PIN Form */}
      {showSetup && (
        <div
          className="bg-card border border-border rounded-xl p-4 space-y-3"
          data-ocid="security.pin.setup.panel"
        >
          <p className="text-sm font-semibold text-foreground">Set Up PIN</p>
          <div className="space-y-2">
            <Label className="text-xs">New PIN (min 4 digits)</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="security.pin.new.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Confirm PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="security.pin.confirm.input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={setupPin}
              className="flex-1 text-xs"
              data-ocid="security.pin.save.button"
            >
              Save PIN
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowSetup(false);
                setPin("");
                setConfirmPin("");
              }}
              variant="outline"
              className="flex-1 text-xs"
              data-ocid="security.pin.cancel.button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Change PIN Form */}
      {showChange && (
        <div
          className="bg-card border border-border rounded-xl p-4 space-y-3"
          data-ocid="security.pin.change.panel"
        >
          <p className="text-sm font-semibold text-foreground">Change PIN</p>
          <div className="space-y-2">
            <Label className="text-xs">Current PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="security.pin.current.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">New PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="security.pin.new2.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Confirm New PIN</Label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              placeholder="****"
              data-ocid="security.pin.confirm2.input"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={changePin}
              className="flex-1 text-xs"
              data-ocid="security.pin.update.button"
            >
              Update PIN
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowChange(false);
                setCurrentPin("");
                setPin("");
                setConfirmPin("");
              }}
              variant="outline"
              className="flex-1 text-xs"
              data-ocid="security.pin.cancel2.button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Fingerprint */}
      {fingerprintSupported && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Fingerprint</p>
              <p className="text-xs text-muted-foreground">
                Use device fingerprint sensor
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={requestFingerprint}
            variant="outline"
            className="w-full text-xs"
            data-ocid="security.fingerprint.button"
          >
            <Fingerprint className="h-4 w-4 mr-2" /> Register Fingerprint
          </Button>
        </div>
      )}
    </div>
  );
}
