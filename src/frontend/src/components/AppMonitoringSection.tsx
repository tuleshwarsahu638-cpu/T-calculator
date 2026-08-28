import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CrashEntry {
  message: string;
  stack?: string;
  componentStack?: string;
  time: string;
}

function readCrashLog(): CrashEntry[] {
  try {
    return JSON.parse(localStorage.getItem("crashLog") || "[]");
  } catch {
    return [];
  }
}

export function AppMonitoringSection() {
  const [crashes, setCrashes] = useState<CrashEntry[]>([]);

  useEffect(() => {
    setCrashes(readCrashLog());
  }, []);

  const clearLog = () => {
    localStorage.removeItem("crashLog");
    setCrashes([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">Crash Log</h2>
        {crashes.length > 0 && (
          <Button
            onClick={clearLog}
            size="sm"
            variant="outline"
            className="gap-1 text-xs text-destructive"
          >
            <Trash2 size={12} /> Clear
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Real errors caught by the app's crash boundary — no simulated or
        server data, since this app has no server.
      </p>

      {crashes.length === 0 ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              No crashes recorded
            </p>
            <p className="text-xs text-muted-foreground">
              The app hasn't hit any unhandled errors on this device.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {crashes.map((c, i) => (
            <div
              key={`${c.time}-${i}`}
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-1"
            >
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangle size={10} className="mr-1" /> Error
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(c.time).toLocaleString()}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground break-words">
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
