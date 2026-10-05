import type { ServiceKind, TranslationCommand, TranslationEvent } from "@/types/translation";
import type { HandflowSettings } from "@/lib/settings";
import { PythonTranslationService } from "./pythonTranslationService";
import { MockTranslationService } from "./mockTranslationService";

export type Listener = (e: TranslationEvent) => void;

/** Transport-agnostic contract the UI depends on. */
export interface TranslationService {
  readonly kind: ServiceKind;
  /** URL of a video stream (e.g. MJPEG) or null if none. */
  readonly videoUrl: string | null;
  checkHealth(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): void;
  startSession(): Promise<void>;
  stopSession(): Promise<void>;
  send(cmd: TranslationCommand): void;
  subscribe(l: Listener): () => void;
}

export function createTranslationService(s: HandflowSettings): TranslationService {
  return s.mode === "mock"
    ? new MockTranslationService()
    : new PythonTranslationService(s.apiUrl, s.autoReconnect);
}
