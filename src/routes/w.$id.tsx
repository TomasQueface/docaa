import { createFileRoute, useNavigate, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, MessageSquare, FileText, Maximize2, Minimize2, PanelLeftClose, PanelLeft } from "lucide-react";
import { HistorySidebar } from "@/components/doca/HistorySidebar";
import { ChatPanel } from "@/components/doca/ChatPanel";
import { DocumentPreview } from "@/components/doca/DocumentPreview";
import { ExportModal } from "@/components/doca/ExportModal";
import { GeneratingIndicator } from "@/components/doca/GeneratingIndicator";
import { useDoca, docKindExt, docKindLabel } from "@/lib/doca/store";

export const Route = createFileRoute("/w/$id")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("doca-state-v1");
      if (!raw) throw redirect({ to: "/auth", search: { mode: "signup" } });
      try {
        const s = JSON.parse(raw)?.state;
        if (!s?.authed) throw redirect({ to: "/auth", search: { mode: "signin" } });
      } catch (e) {
        if (e && typeof e === "object" && "to" in e) throw e;
      }
    }
  },
  component: Workspace,
});

type View = "split" | "chat-only" | "doc-only";

function Workspace() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const doc = useDoca((s) => s.docs.find((d) => d.id === id));
  const setActive = useDoca((s) => s.setActive);
  const renameDoc = useDoca((s) => s.renameDoc);

  const [view, setView] = useState<View>("split");
  const [exportOpen, setExportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "doc">("chat");

  useEffect(() => { setActive(id); }, [id, setActive]);

  if (!doc) {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center">
        <div>
          <h2 className="font-display text-xl font-medium">Documento não encontrado</h2>
          <Link to="/dashboard" className="mt-4 inline-block text-primary underline-offset-4 hover:underline">Voltar ao dashboard</Link>
        </div>
      </div>
    );
  }

  // Auto-switch to doc tab on mobile when content first arrives
  const hasContent = !!doc.content;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-[240px] md:shrink-0">
        <HistorySidebar activeId={id} />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30" />
          <div className="absolute left-0 top-0 h-full w-[280px] bg-background" onClick={(e) => e.stopPropagation()}>
            <HistorySidebar activeId={id} onSelect={(nid) => { setSidebarOpen(false); navigate({ to: "/w/$id", params: { id: nid } }); }} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-hairline bg-background px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-1.5 text-muted-foreground hover:bg-muted md:hidden"
              aria-label="Menu"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <Link to="/dashboard" className="hidden items-center gap-1.5 rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground md:inline-flex" aria-label="Voltar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <input
              value={doc.name}
              onChange={(e) => renameDoc(id, e.target.value)}
              className="min-w-0 max-w-[40vw] truncate rounded bg-transparent px-1.5 py-1 text-[14px] font-medium text-foreground outline-none transition hover:bg-muted focus:bg-muted"
            />
            <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
              {docKindExt[doc.kind]} · {docKindLabel[doc.kind]}
            </span>
            {doc.status === "generating" && (
              <span className="hidden sm:inline"><GeneratingIndicator kind={doc.kind} /></span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-0.5 rounded-md border border-hairline bg-paper p-0.5 lg:flex">
              <ViewBtn active={view === "split"} onClick={() => setView("split")} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Split" />
              <ViewBtn active={view === "chat-only"} onClick={() => setView("chat-only")} icon={<Minimize2 className="h-3.5 w-3.5" />} label="Chat" />
              <ViewBtn active={view === "doc-only"} onClick={() => setView("doc-only")} icon={<Maximize2 className="h-3.5 w-3.5" />} label="Documento" />
            </div>
            <button
              onClick={() => setExportOpen(true)}
              disabled={!hasContent}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12.5px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-30"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop layout */}
          <div className="hidden flex-1 md:flex">
            {view !== "doc-only" && (
              <div className={`${view === "chat-only" ? "flex-1" : "w-[380px] shrink-0 border-r border-hairline lg:w-[420px]"}`}>
                <ChatPanel docId={id} compact />
              </div>
            )}
            {view !== "chat-only" && (
              <div className="flex-1 overflow-y-auto bg-muted/40 px-6 py-8 lg:px-10 lg:py-12">
                {hasContent ? (
                  <DocumentPreview content={doc.content} generating={doc.status === "generating"} />
                ) : (
                  <EmptyDoc kind={doc.kind} />
                )}
              </div>
            )}
          </div>

          {/* Mobile: tab switcher */}
          <div className="flex flex-1 flex-col md:hidden">
            <div className="flex shrink-0 border-b border-hairline bg-background">
              <MobileTab active={mobileTab === "chat"} onClick={() => setMobileTab("chat")} label="Chat" />
              <MobileTab active={mobileTab === "doc"} onClick={() => setMobileTab("doc")} label="Documento" />
            </div>
            <div className="flex-1 overflow-hidden">
              {mobileTab === "chat" ? (
                <ChatPanel docId={id} compact />
              ) : (
                <div className="h-full overflow-y-auto bg-muted/40 px-4 py-6">
                  {hasContent ? (
                    <DocumentPreview content={doc.content} generating={doc.status === "generating"} />
                  ) : (
                    <EmptyDoc kind={doc.kind} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} kind={doc.kind} name={doc.name} />
    </div>
  );
}

function ViewBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-b-2 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyDoc({ kind }: { kind: import("@/lib/doca/store").DocKind }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
      <FileText className="h-7 w-7 text-muted-foreground/60" strokeWidth={1.2} />
      <h3 className="mt-5 font-display text-lg font-medium">O documento aparece aqui</h3>
      <p className="mt-2 text-[13.5px] text-subtle">
        Escreve na conversa o que precisas — {docKindLabel[kind].toLowerCase()} pronto em segundos.
      </p>
    </div>
  );
}
