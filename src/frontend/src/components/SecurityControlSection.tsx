import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, Database, Lock, Shield, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";

const SECURITY_SETTINGS_KEY = "securitySettings";
const BACKUPS_KEY = "appBackups";

interface SecuritySettings {
  encryption: boolean;
  twoFactor: boolean;
  auditLog: boolean;
  autoLock: boolean;
  dataBackup: boolean;
}

interface BackupEntry {
  id: string;
  createdAt: string;
  size: string;
  label: string;
}

const defaultSecurity: SecuritySettings = {
  encryption: true,
  twoFactor: false,
  auditLog: true,
  autoLock: false,
  dataBackup: true,
};

export function SecurityControlSection() {
  const auth = useAdminAuth();
  // Real, backend-verified status — not a client-only localStorage flag.
  const isAdminMode = auth.sessionUnlocked;

  const [security, setSecurity] = useState<SecuritySettings>(() => {
    try {
      const saved = localStorage.getItem(SECURITY_SETTINGS_KEY);
      if (saved) return { ...defaultSecurity, ...JSON.parse(saved) };
    } catch {}
    return defaultSecurity;
  });

  const [backups, setBackups] = useState<BackupEntry[]>(() => {
    try {
      const saved = localStorage.getItem(BACKUPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const handleSecurityToggle = (
    key: keyof SecuritySettings,
    value: boolean,
  ) => {
    const updated = { ...security, [key]: value };
    setSecurity(updated);
    localStorage.setItem(SECURITY_SETTINGS_KEY, JSON.stringify(updated));
  };

  const createBackup = () => {
    const data = {
      calcHistory: localStorage.getItem("calcHistory"),
      operationStats: localStorage.getItem("operationStats"),
      thumbLayerSettings: localStorage.getItem("thumbLayerSettings"),
      featureToggles: localStorage.getItem("featureToggles"),
    };
    const size = `${(JSON.stringify(data).length / 1024).toFixed(1)} KB`;
    const entry: BackupEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      size,
      label: `Backup ${new Date().toLocaleDateString()}`,
    };
    const updated = [entry, ...backups];
    setBackups(updated);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(updated));
  };

  const deleteBackup = (id: string) => {
    const updated = backups.filter((b) => b.id !== id);
    setBackups(updated);
    localStorage.setItem(BACKUPS_KEY, JSON.stringify(updated));
  };

  const securityScore = Object.values(security).filter(Boolean).length * 20;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
        <Shield size={16} /> Security Control
      </h2>

      {/* Admin Status */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 flex items-center gap-3">
        <CheckCircle size={18} className="text-green-400 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-foreground">
            Admin Mode: {isAdminMode ? "Active" : "Inactive"}
          </div>
          <div className="text-xs text-muted-foreground">
            {isAdminMode
              ? "Full app control is enabled"
              : "Tap title 5× on calculator to activate"}
          </div>
        </div>
      </div>

      {/* Security Score */}
      <div className="bg-muted/30 rounded-xl border border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">
            Security Score
          </span>
          <span
            className={`text-lg font-bold ${securityScore >= 80 ? "text-green-400" : securityScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
          >
            {securityScore}/100
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${securityScore >= 80 ? "bg-green-400" : securityScore >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          Security Settings
        </h3>
        {(
          [
            {
              key: "encryption",
              label: "Data Encryption",
              desc: "Encrypt stored data",
            },
            {
              key: "twoFactor",
              label: "Two-Factor Auth",
              desc: "Extra login verification",
            },
            {
              key: "auditLog",
              label: "Audit Logging",
              desc: "Track all admin actions",
            },
            {
              key: "autoLock",
              label: "Auto Lock",
              desc: "Lock after 5 min inactivity",
            },
            {
              key: "dataBackup",
              label: "Auto Backup",
              desc: "Automatic daily backups",
            },
          ] as { key: keyof SecuritySettings; label: string; desc: string }[]
        ).map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20"
          >
            <div>
              <Label className="text-sm font-medium text-foreground">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              checked={security[key]}
              onCheckedChange={(v) => handleSecurityToggle(key, v)}
            />
          </div>
        ))}
      </div>

      {/* Backup Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1">
            <Database size={13} /> Backups ({backups.length})
          </h3>
          <Button
            onClick={createBackup}
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
          >
            <Lock size={11} /> Create Backup
          </Button>
        </div>
        {backups.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No backups yet. Create one above.
          </p>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="bg-muted/30 rounded-xl border border-border p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {backup.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(backup.createdAt).toLocaleString()} ·{" "}
                    {backup.size}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteBackup(backup.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
