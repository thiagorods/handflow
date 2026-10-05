import { endpoints } from "@/lib/settings";
import type { TranslationCommand, TranslationEvent } from "@/types/translation";
import type { Listener, TranslationService } from "./translationService";

/** Real bridge to the local Python engine (HTTP + WebSocket). */
export class PythonTranslationService implements TranslationService {
  readonly kind = "python" as const;
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private closedByUser = false;
  private retry = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private ep: ReturnType<typeof endpoints>;

  constructor(baseUrl: string, private autoReconnect: boolean) {
    this.ep = endpoints(baseUrl);
  }

  get videoUrl() {
    return this.ep.video;
  }

  private emit(e: TranslationEvent) {
    this.listeners.forEach((l) => l(e));
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  async checkHealth() {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(this.ep.health, { signal: ctrl.signal });
      clearTimeout(t);
      return res.ok;
    } catch (err) {
      console.debug("[handflow] health check failed", err);
      return false;
    }
  }

  async connect() {
    this.closedByUser = false;
    this.emit({ type: "status", status: "connecting" });
    const ok = await this.checkHealth();
    if (!ok) {
      this.emit({ type: "error", message: "offline" });
      return;
    }
    this.openSocket();
  }

  private openSocket() {
    try {
      const ws = new WebSocket(this.ep.ws);
      this.ws = ws;
      ws.onopen = () => {
        this.retry = 0;
        this.emit({ type: "status", status: "connected" });
      };
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data) as TranslationEvent;
          if (data && typeof data === "object" && "type" in data) this.emit(data);
        } catch (err) {
          console.debug("[handflow] invalid message", err);
        }
      };
      ws.onclose = () => {
        this.ws = null;
        if (this.closedByUser) return;
        this.emit({ type: "status", status: "disconnected" });
        if (this.autoReconnect && this.retry < 8) {
          const delay = Math.min(1000 * 2 ** this.retry++, 10000);
          this.retryTimer = setTimeout(() => this.openSocket(), delay);
        }
      };
      ws.onerror = (err) => console.debug("[handflow] websocket error", err);
    } catch (err) {
      console.debug("[handflow] websocket failed", err);
      this.emit({ type: "error", message: "socket" });
    }
  }

  disconnect() {
    this.closedByUser = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.ws?.close();
    this.ws = null;
  }

  async startSession() {
    this.emit({ type: "camera", status: "starting" });
    const res = await fetch(this.ep.start, { method: "POST" }).catch(() => null);
    if (!res?.ok) this.emit({ type: "camera", status: "error" });
  }

  async stopSession() {
    await fetch(this.ep.stop, { method: "POST" }).catch(() => null);
  }

  send(cmd: TranslationCommand) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(cmd));
  }
}
