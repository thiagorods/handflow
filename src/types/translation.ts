export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";
export type CameraStatus = "unknown" | "starting" | "ready" | "error";

export interface TranslationMetrics {
  fps?: number;
  latencyMs?: number;
  inferenceMs?: number;
}

/** Events emitted by the Python service over /ws/translation. */
export type TranslationEvent =
  | { type: "status"; status: "connected" | "connecting" | "disconnected" }
  | { type: "camera"; status: "ready" | "error" | "starting" }
  | { type: "processing"; hand: boolean }
  | { type: "prediction"; sign: string | null; text: string }
  | { type: "metrics"; metrics: TranslationMetrics }
  | { type: "error"; message?: string };

export type TranslationCommand = { type: "command"; action: "clear" | "backspace" };

export type ServiceKind = "python" | "mock";
