import { useCallback, useEffect, useState } from "react";

const KEY_STORAGE = "aiPlusApiKey";

export function useAiPlusKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyState(localStorage.getItem(KEY_STORAGE));
  }, []);

  const setApiKey = useCallback((key: string) => {
    if (key.trim()) {
      localStorage.setItem(KEY_STORAGE, key.trim());
      setApiKeyState(key.trim());
    } else {
      localStorage.removeItem(KEY_STORAGE);
      setApiKeyState(null);
    }
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(KEY_STORAGE);
    setApiKeyState(null);
  }, []);

  return { apiKey, hasKey: !!apiKey, setApiKey, clearApiKey };
}
