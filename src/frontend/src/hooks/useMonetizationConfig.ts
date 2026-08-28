import { useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// Monetization config — every earning module described in one place so
// Admin can turn things on/off and fill in provider details without any
// code changes. This only stores CONFIGURATION (what the admin typed in);
// it does not implement real ad-serving, billing, or payment processing —
// those need the provider's actual SDK (AdMob, Razorpay, Stripe, etc.) and
// a real account, which has to be set up outside this app. Wiring a real
// SDK to read these same values later is a small, isolated change.
// ---------------------------------------------------------------------------

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
}

export interface ModuleDef {
  id: string;
  label: string;
  description: string;
  fields: FieldDef[];
}

export const EARNING_MODULES: ModuleDef[] = [
  {
    id: "bannerAds",
    label: "Banner Ads",
    description: "Screen ke ek hisse mein chhota ad band dikhta hai.",
    fields: [
      { key: "provider", label: "Ad Provider", placeholder: "e.g. AdMob" },
      { key: "appId", label: "App ID" },
      { key: "unitId", label: "Ad Unit ID" },
      { key: "placement", label: "Placement (top/bottom)", placeholder: "bottom" },
    ],
  },
  {
    id: "interstitialAds",
    label: "Interstitial Ads",
    description: "Full-screen ad, kisi action ke baad dikhta hai.",
    fields: [
      { key: "provider", label: "Ad Provider" },
      { key: "unitId", label: "Ad Unit ID" },
      { key: "frequency", label: "Kitni activities ke baad", placeholder: "e.g. 5" },
    ],
  },
  {
    id: "rewardedAds",
    label: "Rewarded Ads",
    description: "User ad dekhta hai aur badle mein kuch benefit paata hai.",
    fields: [
      { key: "provider", label: "Ad Provider" },
      { key: "unitId", label: "Ad Unit ID" },
      { key: "reward", label: "Reward (kya milega)", placeholder: "e.g. 5 credits" },
    ],
  },
  {
    id: "onetimePremium",
    label: "One-Time Premium",
    description: "Ek baar pay karke sab premium features hamesha ke liye unlock.",
    fields: [
      { key: "price", label: "Price" },
      { key: "features", label: "Unlock hone wale features", placeholder: "comma separated" },
    ],
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Monthly/Yearly recurring plan.",
    fields: [
      { key: "monthlyPrice", label: "Monthly Price" },
      { key: "yearlyPrice", label: "Yearly Price" },
      { key: "productId", label: "Subscription Product ID" },
      { key: "features", label: "Premium features", placeholder: "comma separated" },
    ],
  },
  {
    id: "inAppPurchase",
    label: "In-App Purchase",
    description: "Individual products/features ek-ek karke khareedein.",
    fields: [
      { key: "productId", label: "Product ID" },
      { key: "price", label: "Price" },
      { key: "feature", label: "Konsa feature/product" },
    ],
  },
  {
    id: "credits",
    label: "Credits / Tokens",
    description: "Credit packages khareedo, unhe features mein kharch karo.",
    fields: [
      { key: "packageName", label: "Credit Package Name" },
      { key: "price", label: "Price" },
      { key: "creditsAmount", label: "Kitne credits milenge" },
      { key: "usedIn", label: "Kis feature mein use honge" },
    ],
  },
  {
    id: "payPerUse",
    label: "Pay-Per-Use",
    description: "Har use par ek chhota price charge ho.",
    fields: [
      { key: "pricePerUse", label: "Price per use" },
      { key: "feature", label: "Konsa feature paid hoga" },
    ],
  },
  {
    id: "featureUnlock",
    label: "Feature Unlock",
    description: "Ek feature ek baar khareedo, permanent unlock ho jaaye.",
    fields: [
      { key: "featureName", label: "Feature Name" },
      { key: "price", label: "Price" },
    ],
  },
  {
    id: "affiliate",
    label: "Affiliate System",
    description: "Affiliate links se commission kamayein.",
    fields: [
      { key: "provider", label: "Affiliate Provider" },
      { key: "affiliateId", label: "Affiliate ID / Link" },
      { key: "commission", label: "Commission Info" },
    ],
  },
  {
    id: "sponsorship",
    label: "Sponsorship",
    description: "Sponsor ka banner/content dikhayein.",
    fields: [
      { key: "sponsorName", label: "Sponsor Name" },
      { key: "sponsorLink", label: "Sponsor Link" },
      { key: "content", label: "Sponsor Content/Banner Text" },
    ],
  },
  {
    id: "businessPlan",
    label: "Business / B2B Plan",
    description: "Business users ke liye special plan.",
    fields: [
      { key: "planName", label: "Plan Name" },
      { key: "price", label: "Price" },
      { key: "features", label: "Features", placeholder: "comma separated" },
      { key: "licenseInfo", label: "License Information" },
    ],
  },
  {
    id: "marketplaceCommission",
    label: "Marketplace / Service Commission",
    description: "Kisi transaction par commission/fee.",
    fields: [
      { key: "commissionPercent", label: "Commission %" },
      { key: "fixedFee", label: "Fixed Fee" },
      { key: "paymentProvider", label: "Payment Provider" },
    ],
  },
];

export interface ModuleState {
  enabled: boolean;
  values: Record<string, string>;
}

export interface MonetizationConfig {
  masterSwitch: boolean;
  modules: Record<string, ModuleState>;
}

const STORAGE_KEY = "monetizationConfig";

function emptyModuleState(): ModuleState {
  return { enabled: false, values: {} };
}

function readConfig(): MonetizationConfig {
  const base: MonetizationConfig = {
    masterSwitch: false,
    modules: Object.fromEntries(
      EARNING_MODULES.map((m) => [m.id, emptyModuleState()]),
    ),
  };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        masterSwitch: !!parsed.masterSwitch,
        modules: { ...base.modules, ...parsed.modules },
      };
    }
  } catch {}
  return base;
}

export function useMonetizationConfig() {
  const [config, setConfig] = useState<MonetizationConfig>(readConfig);

  const persist = useCallback((next: MonetizationConfig) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setMasterSwitch = useCallback(
    (on: boolean) => {
      persist({ ...config, masterSwitch: on });
    },
    [config, persist],
  );

  const toggleModule = useCallback(
    (id: string, enabled: boolean) => {
      persist({
        ...config,
        modules: {
          ...config.modules,
          [id]: { ...(config.modules[id] || emptyModuleState()), enabled },
        },
      });
    },
    [config, persist],
  );

  const updateModuleField = useCallback(
    (id: string, fieldKey: string, value: string) => {
      persist({
        ...config,
        modules: {
          ...config.modules,
          [id]: {
            ...(config.modules[id] || emptyModuleState()),
            values: { ...(config.modules[id]?.values || {}), [fieldKey]: value },
          },
        },
      });
    },
    [config, persist],
  );

  // A module only actually "counts" as active if both the master switch
  // and the module's own toggle are on — mirrors the spec's example table.
  const isModuleActive = useCallback(
    (id: string) => config.masterSwitch && !!config.modules[id]?.enabled,
    [config],
  );

  return {
    config,
    setMasterSwitch,
    toggleModule,
    updateModuleField,
    isModuleActive,
  };
}
