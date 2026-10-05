import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { Logo } from "./Logo";

const nav = [
  { to: "/translator", label: "Traduzir" },
  { to: "/", label: "Como funciona", hash: "como-funciona" },
  { to: "/about", label: "Sobre" },
] as const;

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
        <Link to="/" aria-label="Handflow — início">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={"hash" in n ? n.hash : undefined}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: true, includeHash: true }}
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {right}
          <Link
            to="/settings"
            aria-label="Configurações"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-8">
        <Logo />
        <p>Tecnologia que aproxima pessoas, sem barreiras.</p>
      </div>
    </footer>
  );
}
