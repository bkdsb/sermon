"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/lib/auth/useAuthUser";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
          <label htmlFor="login-password" className="text-sm font-semibold text-[var(--muted)]">
            Senha
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
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
