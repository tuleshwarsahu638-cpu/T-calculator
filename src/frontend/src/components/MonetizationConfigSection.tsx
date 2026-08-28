import { Switch } from "@/components/ui/switch";
import { ChevronDown, DollarSign } from "lucide-react";
import { useState } from "react";
import { EARNING_MODULES, useMonetizationConfig } from "../hooks/useMonetizationConfig";

export function MonetizationConfigSection() {
  const { config, setMasterSwitch, toggleModule, updateModuleField, isModuleActive } =
    useMonetizationConfig();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        Yeh sirf <strong>configuration</strong> hai — real ads/payments dikhane
        ke liye us provider ka actual account/SDK (AdMob, Razorpay, etc.)
        alag se connect karna hoga. Yahan values save ho jaati hain, code
        badalne ki zaroorat kabhi nahi padegi.
      </div>

      {/* Master switch */}
      <div className="flex items-center justify-between p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
        <div>
          <p className="text-sm font-semibold text-foreground">
            All Monetization
          </p>
          <p className="text-xs text-muted-foreground">
            Off karne par sab earning modules band ho jaate hain.
          </p>
        </div>
        <Switch checked={config.masterSwitch} onCheckedChange={setMasterSwitch} />
      </div>

      <div className="space-y-2">
        {EARNING_MODULES.map((mod) => {
          const state = config.modules[mod.id];
          const expanded = expandedId === mod.id;
          const active = isModuleActive(mod.id);
          return (
            <div
              key={mod.id}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : mod.id)}
                className="w-full flex items-center justify-between p-3 bg-card"
              >
                <div className="flex items-center gap-2 text-left">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {mod.label}
                      {active && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {mod.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={!!state?.enabled}
                    onCheckedChange={(v) => toggleModule(mod.id, v)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {expanded && (
                <div className="p-3 pt-0 space-y-2 bg-card">
                  {mod.fields.map((f) => (
                    <div key={f.key}>
                      <label
                        htmlFor={`${mod.id}-${f.key}`}
                        className="text-[11px] text-muted-foreground"
                      >
                        {f.label}
                      </label>
                      <input
                        id={`${mod.id}-${f.key}`}
                        type="text"
                        value={state?.values?.[f.key] || ""}
                        onChange={(e) =>
                          updateModuleField(mod.id, f.key, e.target.value)
                        }
                        placeholder={f.placeholder}
                        className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs mt-0.5"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
