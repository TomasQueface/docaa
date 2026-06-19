import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/doca/Logo";
import { useDoca } from "@/lib/doca/store";

const search = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Entrar — Doca" },
      { name: "description", content: "Entra na tua conta Doca." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const { mode = "signin" } = Route.useSearch();
  const isSignup = mode === "signup";
  const setAuthed = useDoca((s) => s.setAuthed);
  const onboarded = useDoca((s) => s.onboarded);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAuthed(email.trim());
    navigate({ to: onboarded ? "/dashboard" : "/onboarding" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="px-6 py-5 sm:px-10">
          <Link to="/"><Logo /></Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              {isSignup ? "Nova conta" : "Bem-vindo de volta"}
            </div>
            <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
              {isSignup ? "Começa a entregar." : "Continua o trabalho."}
            </h1>
            <p className="mt-2 text-[14px] text-subtle">
              {isSignup
                ? "Conta grátis. Sem cartão, sem limites frustrantes."
                : "Entra para acederes aos teus documentos."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-md border border-hairline bg-paper px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-hairline bg-paper px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground transition hover:opacity-90"
              >
                {isSignup ? "Criar conta" : "Entrar"}
              </button>
            </form>

            <div className="mt-6 text-center text-[13px] text-subtle">
              {isSignup ? (
                <>Já tens conta? <Link to="/auth" search={{ mode: "signin" }} className="text-foreground underline-offset-4 hover:underline">Entra</Link></>
              ) : (
                <>Novo aqui? <Link to="/auth" search={{ mode: "signup" }} className="text-foreground underline-offset-4 hover:underline">Cria uma conta</Link></>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden border-l border-hairline bg-paper lg:block">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md">
            <blockquote className="font-serif text-2xl italic leading-snug text-foreground">
              "Precisava de entregar o relatório à meia-noite. A Doca tinha-o pronto às onze."
            </blockquote>
            <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Estudante de Engenharia · UEM
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-12 right-12 border-t border-hairline pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Workspace de documentos com IA
        </div>
      </div>
    </div>
  );
}
