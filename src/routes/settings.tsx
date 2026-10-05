import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/handflow/SiteHeader";
import { StatusPill } from "@/components/handflow/StatusDot";
import { useHandflowSettings } from "@/hooks/useHandflowSettings";
import { PythonTranslationService } from "@/services/pythonTranslationService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Handflow" },
      { name: "description", content: "Configure a conexão do Handflow com o serviço de tradução local." },
      { property: "og:title", content: "Configurações — Handflow" },
      { property: "og:description", content: "Endereço do serviço, modo de operação e preferências de visualização." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update } = useHandflowSettings();
  const [url, setUrl] = useState(settings.apiUrl);
  const [test, setTest] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  useEffect(() => setUrl(settings.apiUrl), [settings.apiUrl]);

  const runTest = async () => {
    setTest("testing");
    const ok = await new PythonTranslationService(url, false).checkHealth();
    setTest(ok ? "ok" : "fail");
  };

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-5 px-5 py-12 sm:px-8">
        <h1 className="text-3xl font-bold text-deep">Configurações</h1>

        <Section title="Serviço de tradução" desc="Endereço do aplicativo Handflow (Python) em execução neste computador.">
          <label htmlFor="api" className="text-sm font-medium">Endereço</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id="api" value={url} onChange={(e) => { setUrl(e.target.value); setTest("idle"); }} className="h-11 flex-1 rounded-xl border bg-card px-4 font-mono text-sm" />
            <button onClick={runTest} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-accent">
              {test === "testing" && <Loader2 className="h-4 w-4 animate-spin" />} Testar conexão
            </button>
            <button onClick={() => update({ apiUrl: url })} disabled={url === settings.apiUrl} className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40">
              Salvar
            </button>
          </div>
          <div className="mt-3">
            {test === "ok" && <StatusPill tone="success" label="Conectado" />}
            {test === "fail" && <StatusPill tone="error" label="Não foi possível conectar ao serviço de tradução." />}
          </div>
        </Section>

        <Section title="Modo de operação" desc="O modo demonstração simula eventos para visualizar a interface — não há reconhecimento real.">
          <div className="grid gap-2 sm:grid-cols-2">
            {([["python", "Serviço Python", "Reconhecimento real"], ["mock", "Demonstração", "Eventos simulados"]] as const).map(([v, l, d]) => (
              <button key={v} onClick={() => update({ mode: v })} aria-pressed={settings.mode === v}
                className={cn("rounded-xl border p-4 text-left transition-colors", settings.mode === v ? "border-primary bg-accent" : "bg-card hover:bg-muted")}>
                <p className="font-medium">{l}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Conexão e visualização">
          <Toggle label="Reconectar automaticamente" checked={settings.autoReconnect} onChange={(v) => update({ autoReconnect: v })} />
          <Toggle label="Mostrar pontos da mão (quando o serviço fornecer)" checked={settings.showLandmarks} onChange={(v) => update({ showLandmarks: v })} />
        </Section>

        <Section title="Câmera" desc="Seleção de câmera e resolução são controladas pelo aplicativo Python. Ajustes por aqui estarão disponíveis em uma versão futura.">
          <p className="text-sm text-muted-foreground">Em breve</p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-card">
      <h2 className="text-lg font-bold text-deep">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
      <span className="text-sm">{label}</span>
      <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-primary" : "bg-input")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}
