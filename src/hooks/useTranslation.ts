import { useCallback, useEffect, useReducer, useRef } from "react";
import { createTranslationService, type TranslationService } from "@/services/translationService";
import type { HandflowSettings } from "@/lib/settings";
import type { CameraStatus, ConnectionStatus, TranslationEvent, TranslationMetrics } from "@/types/translation";

export interface TranslationState {
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  isTranslating: boolean;
  handDetected: boolean;
  currentSign: string | null;
  signKey: number;
  translatedText: string;
  error: "offline" | "camera" | "unexpected" | null;
  reconnecting: boolean;
  metrics: TranslationMetrics;
}

const initial: TranslationState = {
  connectionStatus: "idle",
  cameraStatus: "unknown",
  isTranslating: false,
  handDetected: false,
  currentSign: null,
  signKey: 0,
  translatedText: "",
  error: null,
  reconnecting: false,
  metrics: {},
};

type Action = TranslationEvent | { type: "translating"; value: boolean } | { type: "text"; text: string } | { type: "reset" };

function reducer(s: TranslationState, a: Action): TranslationState {
  switch (a.type) {
    case "status":
      return {
        ...s,
        connectionStatus: a.status,
        reconnecting: a.status === "disconnected" && s.connectionStatus === "connected" ? true : a.status === "connected" ? false : s.reconnecting,
        error: a.status === "connected" ? null : s.error,
      };
    case "camera":
      return { ...s, cameraStatus: a.status, error: a.status === "error" ? "camera" : s.error === "camera" ? null : s.error };
    case "processing":
      return { ...s, handDetected: a.hand };
    case "prediction":
      return {
        ...s,
        currentSign: a.sign,
        signKey: a.sign && a.sign !== s.currentSign ? s.signKey + 1 : s.signKey,
        translatedText: a.text,
      };
    case "metrics":
      return { ...s, metrics: { ...s.metrics, ...a.metrics } };
    case "error":
      return { ...s, connectionStatus: "error", error: a.message === "offline" ? "offline" : "unexpected", isTranslating: false };
    case "translating":
      return { ...s, isTranslating: a.value, currentSign: a.value ? s.currentSign : null, handDetected: a.value && s.handDetected };
    case "text":
      return { ...s, translatedText: a.text };
    case "reset":
      return initial;
  }
}

export function useTranslation(settings: HandflowSettings, enabled: boolean) {
  const [state, dispatch] = useReducer(reducer, initial);
  const svc = useRef<TranslationService | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const service = createTranslationService(settings);
    svc.current = service;
    dispatch({ type: "reset" });
    const unsub = service.subscribe(dispatch);
    void service.connect();
    return () => {
      unsub();
      void service.stopSession();
      service.disconnect();
      svc.current = null;
    };
  }, [enabled, settings.apiUrl, settings.mode, settings.autoReconnect]);

  const retry = useCallback(() => {
    void svc.current?.connect();
  }, []);

  const toggle = useCallback(async () => {
    const s = svc.current;
    if (!s) return;
    if (state.isTranslating) {
      await s.stopSession();
      dispatch({ type: "translating", value: false });
    } else {
      dispatch({ type: "translating", value: true });
      await s.startSession();
    }
  }, [state.isTranslating]);

  const backspace = useCallback(() => {
    dispatch({ type: "text", text: state.translatedText.slice(0, -1) });
    svc.current?.send({ type: "command", action: "backspace" });
  }, [state.translatedText]);

  const clear = useCallback(() => {
    dispatch({ type: "text", text: "" });
    svc.current?.send({ type: "command", action: "clear" });
  }, []);

  return { state, toggle, retry, backspace, clear, videoUrl: svc.current?.videoUrl ?? null, kind: settings.mode };
}
