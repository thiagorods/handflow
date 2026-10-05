import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, Camera, Hand, Type } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/handflow/SiteHeader";
import { Waves } from "@/components/handflow/Waves";
import { LogoMark } from "@/components/handflow/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Handflow — Libras para texto em tempo real" },
      { name: "description", content: "O Handflow usa visão computacional e aprendizado de máquina para reconhecer sinais de Libras e transformá-los em texto." },
      { property: "og:title", content: "Handflow — Tecnologia que aproxima pessoas" },
      { property: "og:description", content: "Reconhecimento de sinais de Libras e tradução para texto em tempo real." },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "01", title: "Capture", text: "A câmera captura os movimentos da mão.", icon: Camera },
  { n: "02", title: "Detecte", text: "O sistema identifica a mão e seus pontos-chave.", icon: Hand },
  { n: "03", title: "Reconheça", text: "O modelo de Machine Learning identifica o sinal.", icon: Brain },
  { n: "04", title: "Traduza", text: "O sinal reconhecido é convertido em texto em tempo real.", icon: Type },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="relative overflow-hidden bg-soft">
        <Waves className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Acessibilidade · Visão computacional · Libras
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] text-deep sm:text-6xl">
              Tecnologia que aproxima pessoas, <span className="text-brand">sem barreiras.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              O Handflow utiliza visão computacional e aprendizado de máquina para reconhecer sinais de Libras e transformá-los em texto em tempo real.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/translator" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-display text-sm font-semibold text-primary-foreground shadow-cta hover:brightness-105">
                Experimentar o tradutor <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#como-funciona" className="inline-flex h-12 items-center rounded-full border bg-card px-6 font-display text-sm font-semibold text-deep hover:bg-accent">
                Como funciona
              </a>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8">
        <h2 className="text-3xl font-bold text-deep sm:text-4xl">Como funciona</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">Do movimento da mão ao texto, em quatro etapas.</p>
        <ol className="relative mt-12 grid gap-6 md:grid-cols-4">
          <div aria-hidden className="absolute left-0 right-0 top-7 hidden h-px bg-brand opacity-40 md:block" />
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-card text-primary shadow-card">
                <s.icon className="h-6 w-6" />
              </span>
              <p className="mt-5 font-display text-sm font-semibold text-primary">{s.n}</p>
              <h3 className="mt-1 text-xl font-bold text-deep">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-sm text-muted-foreground">
          Atualmente reconhece sinais estáticos das letras A, B, C, D, E, F, G, I, L, M, N, O, P, Q, R, S, T, U, V e W. O projeto está em evolução.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}

function HeroPreview() {
  return (
    <div aria-hidden className="relative rounded-3xl border bg-card p-4 shadow-card">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand">
        <svg viewBox="0 0 200 120" className="absolute inset-0 h-full w-full">
          {[[100, 95], [85, 80], [75, 62], [70, 45], [92, 55], [92, 35], [92, 20], [104, 55], [106, 32], [107, 15], [116, 58], [119, 38], [121, 24], [126, 64], [131, 48], [134, 37]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.2" fill="var(--primary-foreground)" opacity="0.9" />
          ))}
          <path d="M100 95 L85 80 L75 62 L70 45 M100 95 L92 55 L92 35 L92 20 M100 95 L104 55 L106 32 L107 15 M100 95 L116 58 L119 38 L121 24 M100 95 L126 64 L131 48 L134 37" stroke="var(--primary-foreground)" strokeWidth="0.8" fill="none" opacity="0.6" />
        </svg>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent font-display text-3xl font-bold text-primary">B</span>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Texto traduzido</p>
          <p className="font-display text-2xl font-bold text-deep">OLÁ B</p>
        </div>
        <LogoMark className="ml-auto h-8 w-8 opacity-80" />
      </div>
    </div>
  );
}
