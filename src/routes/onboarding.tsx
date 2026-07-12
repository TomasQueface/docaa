import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { GraduationCap, Briefcase, Presentation, Table2 } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/doca/Logo";
import { useOnboarding } from "@/lib/doca/queries";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { mode: "signup" } });
  },
  component: Onboarding,
});

const OPTIONS = [
  {
    id: "academic",
    Icon: GraduationCap,
    title: "Trabalhos académicos",
    desc: "Relatórios, monografias, resumos.",
  },
  {
    id: "office",
    Icon: Briefcase,
    title: "Documentos de escritório",
    desc: "Memorandos, propostas, contratos.",
  },
  {
    id: "slides",
    Icon: Presentation,
    title: "Apresentações",
    desc: "Slides para reuniões e aulas.",
  },
  { id: "sheets", Icon: Table2, title: "Planilhas", desc: "Orçamentos, cálculos, listagens." },
];

function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null);
  const onboarding = useOnboarding();
  const navigate = useNavigate();

  const submit = async () => {
    if (!selected) return;
    await onboarding.mutateAsync(selected);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-hairline px-6 py-5 sm:px-10">
        <Logo />
      </header>
      <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Passo 1 de 1
        </div>
        <h1 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          O que precisas gerar mais?
        </h1>
        <p className="mt-3 text-[14px] text-subtle">
          Vamos preparar atalhos e sugestões para o teu trabalho. Podes mudar depois.
        </p>

        <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {OPTIONS.map(({ id, Icon, title, desc }) => {
            const active = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-hairline bg-paper hover:border-muted-foreground/40"
                }`}
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
                <div>
                  <div className="font-display text-[15px] font-semibold">{title}</div>
                  <div className="mt-0.5 text-[12.5px] text-subtle">{desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={submit}
          disabled={!selected || onboarding.isPending}
          className="mt-8 w-full rounded-md bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-8"
        >
          {onboarding.isPending ? "A guardar…" : "Continuar"}
        </button>
      </main>
    </div>
  );
}
