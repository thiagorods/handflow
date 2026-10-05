import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type HandflowSettings } from "@/lib/settings";

export function useHandflowSettings() {
  const [settings, setSettings] = useState<HandflowSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);
  const update = useCallback((patch: Partial<HandflowSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);
  return { settings, update, loaded };
}
