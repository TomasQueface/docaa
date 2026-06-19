import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { Plus, FileText, Presentation, Table2, FileType, ArrowRight } from "lucide-react";
import { HistorySidebar } from "@/components/doca/HistorySidebar";
import { DocKindIcon } from "@/components/doca/DocKindIcon";
import { useDoca, docKindLabel, type DocKind } from "@/lib/doca/store";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("doca-state-v1");
      if (!raw) throw redirect({ to: "/auth", search: { mode: "signup" } });
      try {
        const s = JSON.parse(raw)?.state;
        if (!s?.authed) throw redirect({ to: "/auth", search: { mode: "signin" } });
        if (!s?.onboarded) throw redirect({ to: "/onboarding" });
      } catch (e) {
        if (e && typeof e === "object" && "to" in e) throw e;
      }
    }
  },
  component: Dashboard,
});

const QUICK: { kind: DocKind; Icon: typeof FileText; label: string; desc: string }[] = [
  { kind: "word", Icon: FileText, label: "Word", desc: "Relatório, ensaio, carta" },
  { kind: "slides", Icon: Presentation, label: "Apresentação", desc: "Slides para reunião ou aula" },
  { kind: "sheet", Icon: Table2, label: "Planilha", desc: "Orçamento, lista, cálculo" },
  { kind: "pdf", Icon: FileType, label: "PDF", desc: "Documento pronto a partilhar" },
];

function Dashboard() {
  const docs = useDoca((s) => s.docs);
  const createDoc = useDoca((s) => s.createDoc);
  const navigate = useNavigate();

  const start = (kind: DocKind) => {
    const id = createDoc(kind);
    navigate({ to: "/w/$id", params: { id } });
  };

  return (
    <div className="grid h-screen w-full md:grid-cols-[260px_1fr]">
      <div className="hidden md:block">
        <HistorySidebar />
      </div>

      <main className="overflow-y-auto">
        <header className="flex items-center justify-between border-b border-hairline px-5 py-4 sm:px-10">
          <div className="md:hidden">
            <Link to="/dashboard"><span className="font-display text-lg font-semibold">Doca</span></Link>
          </div>
          <div className="hidden md:block">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Workspace</div>
          </div>
          <button
            onClick={() => start("word")}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Novo documento
          </button>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10 sm:py-14">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Bom trabalho</div>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            O que vamos terminar hoje?
          </h1>

          <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK.map(({ kind, Icon, label, desc }) => (
              <button
                key={kind}
                onClick={() => start(kind)}
                className="group flex flex-col items-start gap-3 rounded-lg border border-hairline bg-paper p-5 text-left transition hover:border-primary/50 hover:shadow-sm"
              >
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-[15px] font-semibold">{label}</div>
                  <div className="mt-1 text-[12.5px] text-subtle">{desc}</div>
                </div>
                <div className="mt-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition group-hover:text-primary">
                  Começar <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-14 flex items-baseline justify-between border-b border-hairline pb-3">
            <h2 className="font-display text-base font-semibold">Recentes</h2>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {docs.length} {docs.length === 1 ? "documento" : "documentos"}
            </div>
          </div>

          {docs.length === 0 ? (
            <div className="mt-12 rounded-lg border border-dashed border-hairline bg-paper px-6 py-16 text-center">
              <div className="mx-auto inline-flex"><DocKindIcon kind="word" size={36} /></div>
              <h3 className="mt-5 font-display text-lg font-medium">Nenhum documento ainda</h3>
              <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-subtle">
                Descreve o que precisas e eu começo a construir.
              </p>
              <button
                onClick={() => start("word")}
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Novo documento
              </button>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-hairline">
              {docs.map((d) => (
                <li key={d.id}>
                  <Link
                    to="/w/$id"
                    params={{ id: d.id }}
                    className="flex items-center gap-4 py-4 transition hover:bg-muted/40"
                  >
                    <DocKindIcon kind={d.kind} size={26} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-[14px] text-foreground">{d.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>{docKindLabel[d.kind]}</span>
                        <span>·</span>
                        <span>{new Date(d.updatedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</span>
                        {d.status === "ready" && <><span>·</span><span className="text-success">pronto</span></>}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
