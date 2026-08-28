import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Wrench } from "lucide-react";
import { DEFAULT_FLAGS, useFeatureFlags } from "../hooks/useFeatureFlags";

const ROWS: Array<{
  key: keyof typeof DEFAULT_FLAGS;
  label: string;
  description: string;
}> = [
  {
    key: "aiPlusEnabled",
    label: "AI+",
    description: "Off karne par AI+ tab poore app mein disable ho jaata hai.",
  },
  {
    key: "premiumEnabled",
    label: "Premium",
    description: "Premium features ko globally available/unavailable karein.",
  },
  {
    key: "adsEnabled",
    label: "Ads",
    description: "Master ad switch — sirf tab dikhta hai jab user online ho, aur calculator ke bilkul neeche, chhota aur non-intrusive.",
  },
  {
    key: "experimentalToolsEnabled",
    label: "Experimental Tools",
    description: "Naye/beta calculator tools ko early access ke liye on karein.",
  },
];

export function FeatureControlSection() {
  const { flags, updateFlag } = useFeatureFlags();

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        Yeh sab is device par turant apply hote hain, bina app update kiye.
      </div>

      {ROWS.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between p-3 rounded-xl border border-border"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{row.label}</p>
            <p className="text-[11px] text-muted-foreground">{row.description}</p>
          </div>
          <Switch
            checked={!!flags[row.key]}
            onCheckedChange={(v) => updateFlag(row.key, v)}
          />
        </div>
      ))}

      {/* AI+ usage limit + rewarded ad */}
      <div className="rounded-xl border border-border p-3 space-y-2.5">
        <p className="text-sm font-semibold text-foreground">
          AI+ Usage Limit (Optional)
        </p>
        <p className="text-[11px] text-muted-foreground">
          0 = unlimited (default). Set karne par har din itne hi free AI+
          questions milenge — offline calculator/Free AI par koi asar nahi
          padega.
        </p>
        <div>
          <label className="text-[11px] text-muted-foreground">
            Daily Free Limit (0 = unlimited)
          </label>
          <input
            type="number"
            min={0}
            value={flags.aiDailyFreeLimit}
            onChange={(e) =>
              updateFlag("aiDailyFreeLimit", Math.max(0, Number(e.target.value) || 0))
            }
            className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs mt-0.5"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-xs font-medium text-foreground">
              Rewarded Ad — Extra Usage
            </p>
            <p className="text-[11px] text-muted-foreground">
              User ad dekhkar extra questions unlock kar sake.
            </p>
          </div>
          <Switch
            checked={flags.rewardedAdForAiEnabled}
            onCheckedChange={(v) => updateFlag("rewardedAdForAiEnabled", v)}
          />
        </div>
        {flags.rewardedAdForAiEnabled && (
          <div>
            <label className="text-[11px] text-muted-foreground">
              Reward per ad (extra questions)
            </label>
            <input
              type="number"
              min={1}
              value={flags.aiRewardPerAd}
              onChange={(e) =>
                updateFlag("aiRewardPerAd", Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs mt-0.5"
            />
          </div>
        )}
      </div>

      {/* Version management */}
      <div className="rounded-xl border border-border p-3 space-y-2.5">
        <p className="text-sm font-semibold text-foreground">
          Version Management
        </p>
        <p className="text-[11px] text-muted-foreground">
          Khaali chhodne par kuch nahi hota. Value dene par, jab bhi current
          version usse purana ho aur user online ho, ek chhota non-blocking
          banner dikhega — app band nahi hoga.
        </p>
        <div>
          <label className="text-[11px] text-muted-foreground">
            Minimum Recommended Version
          </label>
          <input
            type="text"
            value={flags.minSupportedVersion}
            onChange={(e) => updateFlag("minSupportedVersion", e.target.value)}
            placeholder="e.g. 1.4.0"
            className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs mt-0.5"
          />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">
            Update Message
          </label>
          <Textarea
            value={flags.updateMessage}
            onChange={(e) => updateFlag("updateMessage", e.target.value)}
            className="text-xs mt-0.5"
            rows={2}
          />
        </div>
      </div>

      {/* Maintenance mode */}
      <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-foreground">
              Maintenance Mode
            </p>
          </div>
          <Switch
            checked={flags.maintenanceMode}
            onCheckedChange={(v) => updateFlag("maintenanceMode", v)}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          On karne par sabhi users ko yeh message dikhega (aap khud lock nahi
          honge — Admin session isse bypass kar deta hai).
        </p>
        <Textarea
          value={flags.maintenanceMessage}
          onChange={(e) => updateFlag("maintenanceMessage", e.target.value)}
          className="text-xs"
          rows={2}
        />
      </div>
    </div>
  );
}
