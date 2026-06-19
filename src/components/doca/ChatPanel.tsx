import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { useDoca, type ChatMessage } from "@/lib/doca/store";
import { inferKindFromPrompt, buildMockContent, assistantReply } from "@/lib/doca/mock-generator";

const uid = () => Math.random().toString(36).slice(2, 10);

interface Props {
  docId: string;
  compact?: boolean;
}

export function ChatPanel({ docId, compact = false }: Props) {
  const doc = useDoca((s) => s.docs.find((d) => d.id === docId));
  const appendMessage = useDoca((s) => s.appendMessage);
  const setContent = useDoca((s) => s.setContent);
  const setStatus = useDoca((s) => s.setStatus);
  const renameDoc = useDoca((s) => s.renameDoc);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [doc?.messages.length, sending]);

  if (!doc) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    appendMessage(docId, userMsg);

    const kind = doc.content?.kind ?? inferKindFromPrompt(text);
    setStatus(docId, "generating");

    // Simulate streaming generation
    await new Promise((r) => setTimeout(r, 700));
    const content = buildMockContent(text, kind);
    setContent(docId, content);

    if (doc.messages.length === 0) {
      renameDoc(docId, content.title.slice(0, 60));
    }

    await new Promise((r) => setTimeout(r, 900));
    const reply: ChatMessage = {
      id: uid(), role: "assistant",
      content: assistantReply(text, kind),
      createdAt: Date.now(),
    };
    appendMessage(docId, reply);
    setStatus(docId, "ready");
    setSending(false);
  };

  const empty = doc.messages.length === 0;

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
          <div className={`mx-auto flex max-w-2xl flex-col gap-6 ${compact ? "px-4 py-5" : "px-5 py-6"}`}>
            {doc.messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {sending && (
              <div className="text-[13px] text-subtle doca-fade-up">
                <span className="doca-caret">A pensar</span>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={submit} className="border-t border-hairline bg-background px-4 py-3 sm:px-5 sm:py-4">
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
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
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
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Doca</div>
      <div className="text-[14px] leading-relaxed text-foreground">{msg.content}</div>
    </div>
  );
}
