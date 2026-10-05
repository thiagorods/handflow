import { cn } from "@/lib/utils";

export type Tone = "success" | "warning" | "error" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground/40",
};

export function StatusDot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  return <span aria-hidden className={cn("inline-block h-2 w-2 shrink-0 rounded-full", toneClass[tone], pulse && "animate-soft-pulse")} />;
}

export function StatusPill({ tone, label, pulse, className }: { tone: Tone; label: string; pulse?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-foreground", className)}>
      <StatusDot tone={tone} pulse={pulse} />
      {label}
    </span>
  );
}
