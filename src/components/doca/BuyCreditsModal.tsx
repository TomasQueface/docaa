import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAddTestCredits } from "@/lib/doca/queries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BuyCreditsModal({ open, onClose }: Props) {
  const addTestCredits = useAddTestCredits();
  if (!open) return null;

  const addCredits = async () => {
    try {
      await addTestCredits.mutateAsync(5);
      toast.success("5 créditos de teste adicionados");
      onClose();
    } catch {
      toast.error("Não foi possível adicionar créditos");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-xl border border-hairline bg-paper p-6 shadow-2xl doca-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Créditos
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold">Comprar créditos</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-subtle hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[13.5px] leading-relaxed text-subtle">
          Pagamento via M-Pesa e e-Mola chega em breve. Por agora, adiciona créditos de teste para
          continuar a experimentar a Doca.
        </p>

        <button
          onClick={addCredits}
          disabled={addTestCredits.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {addTestCredits.isPending ? "A adicionar…" : "+5 créditos (teste)"}
        </button>
      </div>
    </div>
  );
}
