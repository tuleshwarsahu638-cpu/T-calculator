import { useCallback, useState } from "react";

// Same pattern/rationale as useMonetizationConfig.ts — this stores what the
// admin typed in, ready for a real payment gateway or AI provider SDK to
// read later. It does not process any real payment or call any real AI
// provider itself.

export interface PaymentConfig {
  provider: string;
  merchantId: string;
  currency: string;
  commissionPercent: string;
  fixedFee: string;
  refundPolicy: string;
}

export interface AiProviderConfig {
  enabled: boolean;
  provider: string;
  model: string;
  usageLimit: string;
}

export interface AdConfig {
  masterAdsEnabled: boolean;
  provider: string;
  appId: string;
}

interface ProviderConfigBundle {
  payment: PaymentConfig;
  aiPlus: AiProviderConfig;
  ads: AdConfig;
}

const STORAGE_KEY = "providerConfig";

const DEFAULTS: ProviderConfigBundle = {
  payment: {
    provider: "",
    merchantId: "",
    currency: "INR",
    commissionPercent: "",
    fixedFee: "",
    refundPolicy: "",
  },
  aiPlus: {
    enabled: true,
    provider: "User's own API key (current)",
    model: "",
    usageLimit: "",
  },
  ads: {
    masterAdsEnabled: false,
    provider: "",
    appId: "",
  },
};

function readConfig(): ProviderConfigBundle {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        payment: { ...DEFAULTS.payment, ...parsed.payment },
        aiPlus: { ...DEFAULTS.aiPlus, ...parsed.aiPlus },
        ads: { ...DEFAULTS.ads, ...parsed.ads },
      };
    }
  } catch {}
  return DEFAULTS;
}

export function useProviderConfig() {
  const [config, setConfig] = useState<ProviderConfigBundle>(readConfig);

  const persist = useCallback((next: ProviderConfigBundle) => {
    setConfig(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const updatePayment = useCallback(
    (patch: Partial<PaymentConfig>) => {
      persist({ ...config, payment: { ...config.payment, ...patch } });
    },
    [config, persist],
  );

  const updateAiPlus = useCallback(
    (patch: Partial<AiProviderConfig>) => {
      persist({ ...config, aiPlus: { ...config.aiPlus, ...patch } });
    },
    [config, persist],
  );

  const updateAds = useCallback(
    (patch: Partial<AdConfig>) => {
      persist({ ...config, ads: { ...config.ads, ...patch } });
    },
    [config, persist],
  );

  return { config, updatePayment, updateAiPlus, updateAds };
}
