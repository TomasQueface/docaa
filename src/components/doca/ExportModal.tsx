import { useState } from "react";
import { X, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { docKindExt, docKindLabel, type DocKind } from "@/lib/doca/store";

interface Props {
  open: boolean;
  onClose: () => void;
  kind: DocKind;
  name: string;
}

const FORMATS: { kind: DocKind; desc: string }[] = [
  { kind: "word", desc: "Editável no Word ou Google Docs" },
  { kind: "slides", desc: "Editável no PowerPoint ou Keynote" },
  { kind: "sheet", desc: "Editável no Excel ou Google Sheets" },
  { kind: "pdf", desc: "Pronto para impressão e partilha" },
];

export function ExportModal({ open, onClose, kind, name }: Props) {
  const [selected, setSelected] = useState<DocKind>(kind);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-xl border border-hairline bg-paper p-6 shadow-2xl doca-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exportar</div>
            <h2 className="mt-1 font-display text-xl font-semibold">{name}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-subtle hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          {FORMATS.map((f) => {
            const isActive = selected === f.kind;
            return (
              <button
                key={f.kind}
                onClick={() => setSelected(f.kind)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left transition ${
                  isActive ? "border-primary bg-primary/5" : "border-hairline hover:border-muted-foreground/40"
                }`}
              >
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-foreground">
                    {docKindExt[f.kind]} · {docKindLabel[f.kind]}
                  </div>
                  <div className="mt-0.5 text-[12px] text-subtle">{f.desc}</div>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            toast.success(`${name}${docKindExt[selected]} pronto`, {
              description: "O documento foi exportado.",
            });
            onClose();
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          Baixar {docKindExt[selected]}
        </button>
      </div>
    </div>
  );
}
