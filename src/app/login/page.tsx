"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/lib/auth/useAuthUser";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M2.7 12c1.6-3.6 5-6 9.3-6s7.7 2.4 9.3 6c-1.6 3.6-5 6-9.3 6s-7.7-2.4-9.3-6Z" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a3.2 3.2 0 0 0 4.5 4.5" />
      <path d="M6.2 6.3A11.4 11.4 0 0 0 2.7 12c1.6 3.6 5 6 9.3 6 2.1 0 4-.6 5.6-1.7" />
      <path d="M9.2 4.7A10.7 10.7 0 0 1 12 4.3c4.3 0 7.7 2.4 9.3 6a12 12 0 0 1-1.8 3" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/sermoes");
    }
  }, [loading, router, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        router.push("/sermoes");
        router.refresh();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password
        });

        if (signUpError) throw signUpError;
        setSuccess("Conta criada. Se o projeto exigir confirmação por e-mail, valide sua caixa de entrada antes de entrar.");
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Falha de autenticação.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Informe seu e-mail para enviar o link de recuperação.");
      return;
    }

    setSendingReset(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetError) throw resetError;
      setSuccess("Enviamos um link para redefinir sua senha. Verifique seu e-mail.");
    } catch (resetSubmitError) {
      const message = resetSubmitError instanceof Error ? resetSubmitError.message : "Falha ao enviar e-mail de recuperação.";
      setError(message);
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_28px_rgba(28,35,46,0.08)]">
      <header className="mb-5 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Acesso</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Entre para criar e editar seus sermões.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-semibold text-[var(--muted)]">
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="text-sm font-semibold text-[var(--muted)]">
              Senha
            </label>

            {mode === "signin" ? (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="text-xs font-semibold text-[var(--primary)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingReset ? "Enviando..." : "Esqueceu a senha?"}
              </button>
            ) : null}
          </div>

          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-[var(--primary)]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted)] transition hover:bg-[#f2ecdf] hover:text-[var(--primary)]"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              title={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Processando..." : mode === "signin" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-[var(--muted)]">
          {mode === "signin" ? "Não tem conta?" : "Já tem conta?"}
        </span>
        <button
          type="button"
          onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
          className="font-semibold text-[var(--primary)]"
        >
          {mode === "signin" ? "Cadastrar" : "Entrar"}
        </button>
      </div>
    </section>
  );
}
