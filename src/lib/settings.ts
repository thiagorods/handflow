import type { ServiceKind } from "@/types/translation";

export interface HandflowSettings {
  apiUrl: string;
  mode: ServiceKind;
  autoReconnect: boolean;
  showLandmarks: boolean;
}

export const DEFAULT_API_URL =
  (import.meta.env.VITE_PYTHON_API_URL as string | undefined) ?? "http://127.0.0.1:8000";

export const DEFAULT_SETTINGS: HandflowSettings = {
  apiUrl: DEFAULT_API_URL,
  mode: "python",
  autoReconnect: true,
  showLandmarks: true,
};

const KEY = "handflow.settings";

/** Browser only — call from effects or handlers. */
export function loadSettings(): HandflowSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: HandflowSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export const endpoints = (base: string) => {
  const b = base.replace(/\/$/, "");
  return {
    health: `${b}/api/health`,
    start: `${b}/api/session/start`,
    stop: `${b}/api/session/stop`,
    video: `${b}/api/video/stream`,
    ws: `${b.replace(/^http/, "ws")}/ws/translation`,
  };
};
