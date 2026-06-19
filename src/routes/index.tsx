import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Presentation, Table2, FileType } from "lucide-react";
import { Logo } from "@/components/doca/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doca — Termina o trabalho, não só a conversa" },
      { name: "description", content: "Workspace de documentos com IA: Word, PowerPoint, Excel e PDF profissionais. Sem limites frustrantes." },
      { property: "og:title", content: "Doca — Workspace de documentos com IA" },
      { property: "og:description", content: "Para estudantes e profissionais que precisam de entregar trabalho, não de impressionar." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/auth"
              className="rounded-md px-3 py-2 text-[13px] font-medium text-subtle transition hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Começar grátis
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                — Para terminar trabalho, não conversar
              </div>
              <h1 className="mt-6 font-display text-[44px] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[58px]">
                Trabalhos prontos.<br />
                <span className="font-serif italic text-subtle">Não só respostas.</span>
              </h1>
              <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-subtle">
                Doca é um workspace de IA pensado para quem precisa de entregar:
                gera Word, PowerPoint, Excel e PDF profissionais — completos, sem o
                limite frustrante dos planos grátis genéricos.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-md border border-hairline bg-paper px-5 py-3 text-[14px] font-medium text-foreground transition hover:border-muted-foreground/40"
                >
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Sem cartão</span>
                <span className="h-px w-6 bg-hairline" />
                <span>Feito em Moçambique</span>
              </div>
            </div>

            <PreviewMock />
          </div>
        </section>

        <section className="border-y border-hairline bg-paper">
          <div className="mx-auto grid max-w-6xl gap-px bg-hairline px-0 sm:grid-cols-4">
            {[
              { Icon: FileText, label: "Word", desc: ".docx editável" },
              { Icon: Presentation, label: "PowerPoint", desc: ".pptx pronto" },
              { Icon: Table2, label: "Excel", desc: ".xlsx com fórmulas" },
              { Icon: FileType, label: "PDF", desc: "Pronto a imprimir" },
            ].map(({ Icon, label, desc }) => (
              <div key={label} className="bg-paper px-6 py-7">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <div className="mt-4 font-display text-base font-semibold">{label}</div>
                <div className="mt-1 text-[12px] text-subtle">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-10">
            {[
              {
                n: "01",
                title: "Descreve o trabalho",
                body: "Escreve o que precisas — um relatório, uma apresentação, uma planilha. Em Português, do teu jeito.",
              },
              {
                n: "02",
                title: "Vê a ser construído",
                body: "O documento aparece ao lado, montado em tempo real. Pedes ajustes na conversa, o ficheiro responde.",
              },
              {
                n: "03",
                title: "Exporta e entrega",
                body: "Baixa em .docx, .pptx, .xlsx ou .pdf. Abre no Word, no Google Docs, onde precisares.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-mono text-[11px] tracking-[0.2em] text-primary">{s.n}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-subtle">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              O trabalho não pode esperar pelo plano pago.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-subtle">
              Doca foi construído para quem entrega — estudantes, freelancers, profissionais
              que precisam do documento pronto, agora.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[14px] font-medium text-primary-foreground transition hover:opacity-90"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 text-[12px] text-muted-foreground sm:flex-row sm:px-8">
          <Logo />
          <div className="font-mono uppercase tracking-[0.18em]">© 2026 Doca</div>
        </div>
      </footer>
    </div>
  );
}

function PreviewMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-muted/60" />
      <div className="doc-paper overflow-hidden rounded-lg">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            A tecer documento
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">.docx</span>
        </div>
        <div className="px-8 py-8 sm:px-10 sm:py-10">
          <h3 className="font-display text-2xl font-semibold leading-tight">
            Energias renováveis em Moçambique
          </h3>
          <div className="mt-1 text-[12px] text-muted-foreground">Relatório · 12 páginas</div>
          <p className="mt-6 text-[13.5px] leading-[1.75] text-foreground">
            Moçambique apresenta um potencial energético notável, particularmente nas
            áreas de energia solar, eólica e hídrica. Este relatório analisa o estado
            actual do sector e identifica oportunidades estratégicas.
          </p>
          <h4 className="mt-5 font-display text-[15px] font-semibold">1. Contexto</h4>
          <p className="mt-2 text-[13.5px] leading-[1.75] text-foreground">
            A matriz energética nacional depende historicamente da hidroeléctrica de
            Cahora Bassa<span className="doca-caret" />
          </p>
        </div>
      </div>
    </div>
  );
}
