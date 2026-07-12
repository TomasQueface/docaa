import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Chrome, Facebook } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/doca/Logo";
import {
  signInWithOAuth,
  signInWithPassword,
  signUpWithPassword,
  type OAuthProvider,
} from "@/lib/auth/actions";

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

function mapAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Algo correu mal. Tenta novamente.";
  if (msg.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com este email.";
  if (msg.toLowerCase().includes("password")) return "A senha deve ter pelo menos 6 caracteres.";
  return msg;
}

function Auth() {
  const { mode = "signin" } = Route.useSearch();
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        const { session } = await signUpWithPassword(email.trim(), password);
        if (!session) {
          setCheckEmail(true);
        } else {
          navigate({ to: "/onboarding" });
        }
      } else {
        await signInWithPassword(email.trim(), password);
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: OAuthProvider) => {
    setError(null);
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(mapAuthError(err));
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 font-display text-2xl font-medium">Confirma o teu email</h1>
          <p className="mt-3 text-[14px] text-subtle">
            Enviámos um link de confirmação para <strong>{email}</strong>. Abre-o para ativar a tua
            conta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col">
        <header className="px-6 py-5 sm:px-10">
          <Link to="/">
            <Logo />
          </Link>
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

            <div className="mt-8 space-y-2.5">
              <button
                type="button"
                onClick={() => oauth("google")}
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-hairline bg-paper px-4 py-2.5 text-[13.5px] font-medium text-foreground transition hover:border-muted-foreground/40"
              >
                <Chrome className="h-4 w-4" />
                Continuar com Google
              </button>
              <button
                type="button"
                onClick={() => oauth("facebook")}
                className="flex w-full items-center justify-center gap-2.5 rounded-md border border-hairline bg-paper px-4 py-2.5 text-[13.5px] font-medium text-foreground transition hover:border-muted-foreground/40"
              >
                <Facebook className="h-4 w-4" />
                Continuar com Facebook
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-hairline" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                ou
              </span>
              <div className="h-px flex-1 bg-hairline" />
            </div>

            <form onSubmit={submit} className="space-y-4">
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-hairline bg-paper px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
              {error && <p className="text-[13px] text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-[14px] font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "A processar…" : isSignup ? "Criar conta" : "Entrar"}
              </button>
            </form>

            <div className="mt-6 text-center text-[13px] text-subtle">
              {isSignup ? (
                <>
                  Já tens conta?{" "}
                  <Link
                    to="/auth"
                    search={{ mode: "signin" }}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Entra
                  </Link>
                </>
              ) : (
                <>
                  Novo aqui?{" "}
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className="text-foreground underline-offset-4 hover:underline"
                  >
                    Cria uma conta
                  </Link>
                </>
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
