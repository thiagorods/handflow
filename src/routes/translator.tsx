import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Check, Copy, Delete, Hand, Loader2, Pause, Play, PlugZap, RefreshCw, Trash2, VideoOff } from "lucide-react";
import { SiteHeader } from "@/components/handflow/SiteHeader";
import { StatusDot, StatusPill, type Tone } from "@/components/handflow/StatusDot";
import { useHandflowSettings } from "@/hooks/useHandflowSettings";
import { useTranslation, type TranslationState } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/translator")({
  head: () => ({
    meta: [
      { title: "Tradutor — Handflow" },
      { name: "description", content: "Traduza sinais de Libras para texto em tempo real com o Handflow." },
      { property: "og:title", content: "Tradutor — Handflow" },
      { property: "og:description", content: "Reconhecimento de sinais de Libras e construção de texto em tempo real." },
    ],
  }),
  component: TranslatorPage,
});

function connectionView(s: TranslationState): { tone: Tone; label: string; pulse?: boolean } {
  if (s.reconnecting) return { tone: "warning", label: "Reconectando…", pulse: true };
  switch (s.connectionStatus) {
    case "connected": return { tone: "success", label: "Tradutor conectado" };
    case "connecting": return { tone: "warning", label: "Conectando…", pulse: true };
    case "disconnected": return { tone: "error", label: "Desconectado" };
    case "error": return { tone: "error", label: "Indisponível" };
    default: return { tone: "neutral", label: "Aguardando" };
  }
}

function TranslatorPage() {
  const { settings, loaded } = useHandflowSettings();
  const t = useTranslation(settings, loaded);
  const { state } = t;
  const conn = connectionView(state);
  const offline = state.error === "offline";

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader right={<StatusPill {...conn} className="hidden sm:inline-flex" />} />
      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-deep sm:text-4xl">Traduza Libras em tempo real.</h1>
            <p className="mt-2 text-muted-foreground">Tecnologia que aproxima pessoas, sem barreiras.</p>
          </div>
          <PrimaryButton state={state} onClick={t.toggle} />
        </div>

        {t.kind === "mock" && (
          <p role="note" className="mb-5 inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-foreground">
            <StatusDot tone="warning" /> Modo demonstração — eventos simulados, sem reconhecimento real.
          </p>
        )}

        {offline ? (
          <ConnectHandflow onRetry={t.retry} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <CameraCard state={state} videoUrl={t.videoUrl} showLandmarks={settings.showLandmarks} />
            <div className="grid gap-5 sm:grid-cols-[180px_1fr] lg:grid-cols-1 lg:grid-rows-[auto_1fr]">
              <SignCard state={state} />
              <TextCard text={state.translatedText} onBackspace={t.backspace} onClear={t.clear} />
            </div>
            <SystemStatus state={state} />
          </div>
        )}
      </main>
    </div>
  );
}

function PrimaryButton({ state, onClick }: { state: TranslationState; onClick: () => void }) {
  const disabled = state.connectionStatus !== "connected";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        state.isTranslating
          ? "border border-deep bg-card text-deep hover:bg-accent"
          : "bg-primary text-primary-foreground shadow-cta hover:brightness-105",
      )}
    >
      {state.isTranslating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {state.isTranslating ? "Pausar tradução" : "Iniciar tradução"}
    </button>
  );
}

function CameraCard({ state, videoUrl, showLandmarks }: { state: TranslationState; videoUrl: string | null; showLandmarks: boolean }) {
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => setVideoFailed(false), [videoUrl, state.isTranslating]);
  const streaming = state.isTranslating && state.cameraStatus === "ready";

  let overlay: { icon: React.ReactNode; title: string; sub?: string } | null = null;
  if (state.connectionStatus !== "connected")
    overlay = { icon: <PlugZap className="h-5 w-5" />, title: "Aguardando conexão com o tradutor" };
  else if (state.cameraStatus === "error" || videoFailed)
    overlay = { icon: <VideoOff className="h-5 w-5" />, title: "Câmera indisponível", sub: "Não foi possível acessar a câmera. Verifique se ela está conectada ou sendo usada por outro aplicativo." };
  else if (!state.isTranslating)
    overlay = { icon: <Camera className="h-5 w-5" />, title: "Câmera pronta", sub: "Clique em “Iniciar tradução” para começar." };
  else if (state.cameraStatus === "starting")
    overlay = { icon: <Loader2 className="h-5 w-5 animate-spin" />, title: "Iniciando câmera…" };

  return (
    <section aria-label="Câmera" className="overflow-hidden rounded-2xl border bg-card p-3 shadow-card lg:row-span-1">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-deep">
        {streaming && videoUrl && !videoFailed && (
          <img src={videoUrl} alt="Vídeo da câmera em tempo real" className="h-full w-full object-cover" onError={() => setVideoFailed(true)} />
        )}
        {streaming && !videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand opacity-90">
            <Hand className="h-24 w-24 text-deep-foreground/30" aria-hidden />
          </div>
        )}

        {overlay ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-deep-foreground">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-deep-foreground/10">{overlay.icon}</span>
            <p className="font-display text-lg font-semibold">{overlay.title}</p>
            {overlay.sub && <p className="max-w-sm text-sm text-deep-foreground/70">{overlay.sub}</p>}
          </div>
        ) : (
          !state.handDetected && (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span className="rounded-full bg-deep/80 px-4 py-2 text-sm text-deep-foreground backdrop-blur">Mostre sua mão para começar</span>
            </div>
          )
        )}

        {streaming && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-deep/75 px-3 py-1 text-xs font-medium text-deep-foreground backdrop-blur">
              <StatusDot tone="success" pulse /> Câmera ativa
            </span>
            {state.handDetected && (
              <span className="inline-flex items-center gap-2 rounded-full bg-deep/75 px-3 py-1 text-xs font-medium text-deep-foreground backdrop-blur">
                <StatusDot tone="info" /> Reconhecendo…
              </span>
            )}
          </div>
        )}
        {streaming && (state.metrics.fps != null || state.metrics.latencyMs != null) && (
          <div className="absolute right-3 top-3 rounded-full bg-deep/75 px-3 py-1 font-mono text-xs text-deep-foreground">
            {state.metrics.fps != null && `${Math.round(state.metrics.fps)} fps`}
            {state.metrics.fps != null && state.metrics.latencyMs != null && " · "}
            {state.metrics.latencyMs != null && `${Math.round(state.metrics.latencyMs)} ms`}
          </div>
        )}
      </div>
      <p className="px-2 pt-3 text-xs text-muted-foreground">
        A câmera é controlada pelo aplicativo Handflow no seu computador.{showLandmarks ? " Pontos da mão exibidos quando disponíveis." : ""}
      </p>
    </section>
  );
}

function SignCard({ state }: { state: TranslationState }) {
  const sign = state.isTranslating ? state.currentSign : null;
  return (
    <section aria-label="Sinal detectado" className="flex flex-col rounded-2xl border bg-card p-5 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sinal detectado</h2>
      <div className="flex flex-1 items-center justify-center py-4" aria-live="polite">
        <span
          key={state.signKey}
          className={cn("font-display text-7xl font-bold leading-none", sign ? "animate-sign-in text-brand" : "text-muted-foreground/40")}
        >
          {sign ?? "—"}
        </span>
      </div>
      <p className="text-center text-xs text-muted-foreground">{sign ? "Sinal reconhecido" : "Nenhum sinal estável"}</p>
    </section>
  );
}

function TextCard({ text, onBackspace, onClear }: { text: string; onBackspace: () => void; onClear: () => void }) {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);
  const empty = text.trim().length === 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.debug(err);
    }
  };
  const clear = () => {
    if (text.length > 20 && !confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false);
    onClear();
    setCleared(true);
    setTimeout(() => setCleared(false), 1600);
  };

  return (
    <section aria-label="Texto traduzido" className="flex flex-col rounded-2xl border bg-card p-5 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Texto traduzido</h2>
      <div className="min-h-32 flex-1 py-4" aria-live="polite">
        {empty ? (
          <p className="text-muted-foreground">{cleared ? "Tradução limpa." : "O texto reconhecido aparecerá aqui."}</p>
        ) : (
          <p className="break-words font-display text-4xl font-bold leading-tight tracking-wide text-deep">{text}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={copy} disabled={empty} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} label={copied ? "Copiado" : "Copiar"} highlight={copied} />
        <ActionButton onClick={onBackspace} disabled={text.length === 0} icon={<Delete className="h-4 w-4" />} label="Apagar" aria="Apagar último caractere" />
        <ActionButton onClick={clear} disabled={text.length === 0} icon={<Trash2 className="h-4 w-4" />} label={confirming ? "Confirmar limpeza" : "Limpar"} danger={confirming} />
      </div>
    </section>
  );
}

function ActionButton({ onClick, disabled, icon, label, aria, highlight, danger }: { onClick: () => void; disabled?: boolean; icon: React.ReactNode; label: string; aria?: string; highlight?: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        highlight ? "border-success bg-success/10 text-foreground" : danger ? "border-destructive bg-destructive/10 text-destructive" : "bg-card text-foreground hover:bg-accent",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SystemStatus({ state }: { state: TranslationState }) {
  const conn = connectionView(state);
  const cam: { tone: Tone; label: string } =
    state.cameraStatus === "ready" && state.isTranslating ? { tone: "success", label: "Câmera ativa" }
    : state.cameraStatus === "starting" ? { tone: "warning", label: "Câmera iniciando" }
    : state.cameraStatus === "error" ? { tone: "error", label: "Câmera indisponível" }
    : { tone: "neutral", label: "Câmera em espera" };
  const rec: { tone: Tone; label: string } = state.isTranslating
    ? state.handDetected ? { tone: "success", label: "Reconhecimento ativo" } : { tone: "warning", label: "Aguardando mão" }
    : { tone: "neutral", label: "Reconhecimento pausado" };

  return (
    <section aria-label="Status do sistema" className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border bg-card px-5 py-4 text-sm shadow-card lg:col-span-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status do sistema</span>
      {[conn, cam, rec].map((s) => (
        <span key={s.label} className="inline-flex items-center gap-2"><StatusDot tone={s.tone} pulse={"pulse" in s && !!s.pulse} />{s.label}</span>
      ))}
      {state.reconnecting && <span className="text-muted-foreground">Conexão perdida. Tentando reconectar…</span>}
      {state.error === "unexpected" && <span className="text-destructive">Algo deu errado. Tente novamente.</span>}
    </section>
  );
}

function ConnectHandflow({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border bg-card p-10 text-center shadow-card">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary"><PlugZap className="h-6 w-6" /></span>
      <h2 className="mt-5 text-2xl font-bold text-deep">Conecte o Handflow</h2>
      <p className="mt-2 text-muted-foreground">Não conseguimos encontrar o serviço de tradução neste dispositivo.</p>
      <button onClick={onRetry} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-semibold text-primary-foreground shadow-cta hover:brightness-105">
        <RefreshCw className="h-4 w-4" /> Tentar novamente
      </button>
      <p className="mt-5 text-sm text-muted-foreground">Certifique-se de que o aplicativo Handflow esteja em execução.</p>
      <Link to="/settings" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Ajustar configurações</Link>
    </section>
  );
}
