import type { TranslationCommand, TranslationEvent } from "@/types/translation";
import type { Listener, TranslationService } from "./translationService";

/**
 * DEVELOPMENT ONLY. Emits scripted events so the interface can be designed
 * without the Python engine running. It performs no recognition.
 */
const SCRIPT = ["O", "L", "A", null, "M", "U", "N", "D", "O", null];

export class MockTranslationService implements TranslationService {
  readonly kind = "mock" as const;
  readonly videoUrl = null;
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private text = "";
  private i = 0;

  private emit(e: TranslationEvent) {
    this.listeners.forEach((l) => l(e));
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
  async checkHealth() {
    return true;
  }
  async connect() {
    this.emit({ type: "status", status: "connecting" });
    setTimeout(() => this.emit({ type: "status", status: "connected" }), 400);
  }
  disconnect() {
    this.stopTimer();
  }
  async startSession() {
    this.emit({ type: "camera", status: "starting" });
    setTimeout(() => this.emit({ type: "camera", status: "ready" }), 600);
    this.stopTimer();
    this.timer = setInterval(() => {
      const sign = SCRIPT[this.i++ % SCRIPT.length];
      if (sign === null) {
        this.emit({ type: "processing", hand: false });
        if (!this.text.endsWith(" ")) this.text += " ";
      } else {
        this.emit({ type: "processing", hand: true });
        this.text += sign;
      }
      this.emit({ type: "prediction", sign, text: this.text });
    }, 1300);
  }
  async stopSession() {
    this.stopTimer();
  }
  send(cmd: TranslationCommand) {
    this.text = cmd.action === "clear" ? "" : this.text.slice(0, -1);
    this.emit({ type: "prediction", sign: null, text: this.text });
  }
  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
