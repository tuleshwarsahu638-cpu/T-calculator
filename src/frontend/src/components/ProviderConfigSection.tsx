import { Switch } from "@/components/ui/switch";
import { CreditCard, Megaphone, Sparkles } from "lucide-react";
import { useProviderConfig } from "../hooks/useProviderConfig";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs mt-0.5"
      />
    </div>
  );
}

export function ProviderConfigSection() {
  const { config, updatePayment, updateAiPlus, updateAds } = useProviderConfig();

  return (
    <div className="space-y-5">
      <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        Yeh settings future mein real Payment/Ad/AI provider connect karne ke
        liye ready structure hai. Abhi values yahin save hoti hain — activate
        hone par developer ko sirf ek jagah SDK jodni hogi, poora app dobara
        nahi banana padega.
      </div>

      {/* Payment */}
      <div className="rounded-xl border border-border p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Payment Provider</h3>
        </div>
        <Field
          label="Provider"
          value={config.payment.provider}
          onChange={(v) => updatePayment({ provider: v })}
          placeholder="e.g. Razorpay, Stripe"
        />
        <Field
          label="Merchant / Account ID"
          value={config.payment.merchantId}
          onChange={(v) => updatePayment({ merchantId: v })}
        />
        <Field
          label="Currency"
          value={config.payment.currency}
          onChange={(v) => updatePayment({ currency: v })}
        />
        <Field
          label="Commission %"
          value={config.payment.commissionPercent}
          onChange={(v) => updatePayment({ commissionPercent: v })}
        />
        <Field
          label="Fixed Fee"
          value={config.payment.fixedFee}
          onChange={(v) => updatePayment({ fixedFee: v })}
        />
        <Field
          label="Refund Policy Note"
          value={config.payment.refundPolicy}
          onChange={(v) => updatePayment({ refundPolicy: v })}
        />
      </div>

      {/* Ads master */}
      <div className="rounded-xl border border-border p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Ads</h3>
          </div>
          <Switch
            checked={config.ads.masterAdsEnabled}
            onCheckedChange={(v) => updateAds({ masterAdsEnabled: v })}
          />
        </div>
        <Field
          label="Ad Provider"
          value={config.ads.provider}
          onChange={(v) => updateAds({ provider: v })}
          placeholder="e.g. AdMob"
        />
        <Field
          label="App ID"
          value={config.ads.appId}
          onChange={(v) => updateAds({ appId: v })}
        />
        <p className="text-[11px] text-muted-foreground">
          Individual ad-type settings (Banner/Interstitial/Rewarded IDs) are
          in the Earning System tab.
        </p>
      </div>

      {/* AI+ Provider */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-foreground">AI+</h3>
          </div>
          <Switch
            checked={config.aiPlus.enabled}
            onCheckedChange={(v) => updateAiPlus({ enabled: v })}
          />
        </div>
        <Field
          label="Provider"
          value={config.aiPlus.provider}
          onChange={(v) => updateAiPlus({ provider: v })}
          placeholder="e.g. Anthropic Claude"
        />
        <Field
          label="Model"
          value={config.aiPlus.model}
          onChange={(v) => updateAiPlus({ model: v })}
        />
        <Field
          label="Usage Limit"
          value={config.aiPlus.usageLimit}
          onChange={(v) => updateAiPlus({ usageLimit: v })}
          placeholder="e.g. 50 messages/day"
        />
        <p className="text-[11px] text-muted-foreground">
          Right now AI+ uses each user's own API key entered inside the app
          (no server involved). This section is ready for when a backend
          proxy with a shared provider key replaces that.
        </p>
      </div>
    </div>
  );
}
