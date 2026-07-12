import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/doca/store";
import { inferKindFromPrompt } from "@/lib/doca/mock-generator";
import { InsufficientCreditsError } from "@/lib/doca/api";
import { useDocument, useProfile, useSendMessage } from "@/lib/doca/queries";
import { BuyCreditsModal } from "./BuyCreditsModal";

interface Props {
  docId: string;
  compact?: boolean;
}

export function ChatPanel({ docId, compact = false }: Props) {
  const { data } = useDocument(docId);
  const { data: profile } = useProfile();
  const sendMessage = useSendMessage();

  const [input, setInput] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [data?.messages.length, sendMessage.isPending]);

  if (!data) return null;
  const { document: doc, messages, conversationId } = data;
  const outOfCredits = (profile?.credits_balance ?? 0) <= 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sendMessage.isPending || !conversationId) return;
    if (outOfCredits) {
      setBuyOpen(true);
      return;
    }
    setInput("");

    const kind = doc.content?.kind ?? inferKindFromPrompt(text);
    try {
      await sendMessage.mutateAsync({
        documentId: doc.id,
        conversationId,
        kind,
        text,
        isFirstMessage: messages.length === 0,
      });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        setBuyOpen(true);
      } else {
        toast.error("Algo correu mal. Tenta novamente.");
      }
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Novo trabalho
            </div>
            <h3 className="mt-4 max-w-sm font-display text-2xl font-medium text-foreground">
              O que precisas terminar?
            </h3>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-subtle">
              Descreve o documento — eu começo a construí-lo ao lado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-[12px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-hairline bg-paper px-3 py-1.5 text-subtle transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`mx-auto flex max-w-2xl flex-col gap-6 ${compact ? "px-4 py-5" : "px-5 py-6"}`}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {sendMessage.isPending && (
              <div className="text-[13px] text-subtle doca-fade-up">
                <span className="doca-caret">A pensar</span>
              </div>
            )}
          </div>
        )}
      </div>

      {outOfCredits && (
        <div className="flex items-center justify-between gap-3 border-t border-hairline bg-destructive/5 px-4 py-2.5 sm:px-5">
          <span className="text-[12.5px] text-destructive">Sem créditos — adicionar pacote</span>
          <button
            onClick={() => setBuyOpen(true)}
            className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-[11.5px] font-medium text-primary-foreground transition hover:opacity-90"
          >
            Comprar créditos
          </button>
        </div>
      )}

      <form
        onSubmit={submit}
        className="border-t border-hairline bg-background px-4 py-3 sm:px-5 sm:py-4"
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-lg border border-hairline bg-paper p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(e as unknown as FormEvent);
                }
              }}
              placeholder="Escreve o que precisas… (Ex: relatório sobre energia solar em Moçambique)"
              rows={1}
              className="min-h-[36px] max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              disabled={sendMessage.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMessage.isPending}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-30"
              aria-label="Enviar"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Enter para enviar · Shift+Enter para nova linha
          </div>
        </div>
      </form>

      <BuyCreditsModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </div>
  );
}

const SUGGESTIONS = [
  "Trabalho sobre energias renováveis",
  "Apresentação para reunião de vendas",
  "Planilha de orçamento mensal",
  "Relatório em PDF",
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end doca-fade-up">
        <div className="max-w-[85%] rounded-lg bg-muted px-4 py-2.5 text-[14px] leading-relaxed text-foreground">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="doca-fade-up">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Doca
      </div>
      <div className="text-[14px] leading-relaxed text-foreground">{msg.content}</div>
    </div>
  );
}
