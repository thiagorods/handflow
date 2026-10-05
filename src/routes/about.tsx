import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/handflow/SiteHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto — Handflow" },
      { name: "description", content: "Handflow é um projeto experimental e educacional de acessibilidade para reconhecimento de Libras." },
      { property: "og:title", content: "Sobre o projeto — Handflow" },
      { property: "og:description", content: "Python, OpenCV, MediaPipe e Machine Learning a serviço da comunicação em Libras." },
    ],
  }),
  component: About,
});

const stack = [
  ["Python", "Motor de reconhecimento executado localmente."],
  ["OpenCV", "Captura e processamento dos quadros da câmera."],
  ["MediaPipe", "Detecção da mão e de 21 pontos-chave (landmarks)."],
  ["Random Forest", "Classificação dos sinais a partir dos landmarks normalizados."],
];

function About() {
  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h1 className="text-4xl font-extrabold text-deep">Sobre o Handflow</h1>
        <p className="mt-5 text-lg text-muted-foreground">
          O Handflow nasceu do projeto SLT — Sign Language Translator, uma solução experimental e educacional que busca facilitar a comunicação entre pessoas que utilizam Libras e pessoas que não dominam a língua.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {stack.map(([t, d]) => (
            <div key={t} className="rounded-2xl border bg-card p-5 shadow-card">
              <h2 className="text-lg font-bold text-deep">{t}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-bold text-deep">Em evolução</h2>
          <p className="mt-2 text-muted-foreground">
            Hoje o sistema reconhece sinais estáticos de 20 letras (A, B, C, D, E, F, G, I, L, M, N, O, P, Q, R, S, T, U, V, W) e os converte em texto. Ele não substitui um intérprete humano nem realiza tradução gramatical completa de Libras para português. Novos sinais, palavras e modelos fazem parte da evolução do projeto.
          </p>
        </div>
        <Link to="/translator" className="mt-10 inline-flex h-12 items-center rounded-full bg-primary px-6 font-display text-sm font-semibold text-primary-foreground shadow-cta">
          Experimentar o tradutor
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
