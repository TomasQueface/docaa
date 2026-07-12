import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, MessageSquare, MoreHorizontal, Trash2, LogOut } from "lucide-react";
import { useState } from "react";
import { docKindLabel } from "@/lib/doca/store";
import { useCreateDocument, useDeleteDocument, useDocuments, useProfile } from "@/lib/doca/queries";
import { signOut } from "@/lib/auth/actions";
import { Logo } from "./Logo";
import { DocKindIcon } from "./DocKindIcon";
import { BuyCreditsModal } from "./BuyCreditsModal";

export function HistorySidebar({
  activeId,
  onSelect,
}: {
  activeId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { data: docs = [] } = useDocuments();
  const { data: profile } = useProfile();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const navigate = useNavigate();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  const handleNew = async () => {
    const { documentId } = await createDocument.mutateAsync({
      kind: "word",
      title: "Novo documento",
    });
    navigate({ to: "/w/$id", params: { id: documentId } });
  };

  return (
    <aside className="flex h-full w-full flex-col border-r border-hairline bg-background">
      <div className="flex items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="text-foreground">
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={handleNew}
          className="flex w-full items-center gap-2.5 rounded-md border border-hairline bg-paper px-3 py-2 text-[13px] font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo documento
        </button>
      </div>

      <div className="px-4 pb-2 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Recentes
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {docs.length === 0 ? (
          <div className="px-3 py-4 text-[12px] text-subtle">Nada por aqui ainda.</div>
        ) : (
          <ul className="space-y-0.5">
            {docs.map((d) => {
              const isActive = d.id === activeId;
              return (
                <li key={d.id} className="group relative">
                  <button
                    onClick={() => {
                      if (onSelect) onSelect(d.id);
                      else navigate({ to: "/w/$id", params: { id: d.id } });
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition ${
                      isActive ? "bg-muted" : "hover:bg-muted/60"
                    }`}
                  >
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-foreground">
                        {d.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>{docKindLabel[d.kind]}</span>
                        <span>·</span>
                        <span>{formatTime(new Date(d.updated_at).getTime())}</span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuId(menuId === d.id ? null : d.id);
                    }}
                    className="absolute right-1 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-hairline"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                  {menuId === d.id && (
                    <div className="absolute right-1 top-9 z-10 rounded-md border border-hairline bg-paper py-1 shadow-lg">
                      <button
                        onClick={() => {
                          deleteDocument.mutate(d.id);
                          setMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-muted"
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-hairline px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[12px] font-medium text-foreground">
              {profile?.email ?? "Convidado"}
            </div>
            <button
              onClick={() => setBuyOpen(true)}
              className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:text-primary"
            >
              {profile ? `${profile.credits_balance} créditos` : "…"}
            </button>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <BuyCreditsModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </aside>
  );
}

function formatTime(t: number) {
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

// Re-export for icon usage
export { DocKindIcon };
