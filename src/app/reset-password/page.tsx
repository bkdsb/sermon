"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setSuccess("Senha redefinida com sucesso. Você já pode entrar.");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : "Falha ao redefinir senha.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_28px_rgba(28,35,46,0.08)]">
      <header className="mb-5 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Redefinir senha</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Defina uma nova senha para sua conta.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-semibold text-[var(--muted)]">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={6}
            required
            className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-semibold text-[var(--muted)]">
            Confirmar senha
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={6}
            required
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
          {submitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>

      <div className="mt-4 text-center text-xs">
        <Link href="/login" className="font-semibold text-[var(--primary)]">
          Voltar para login
        </Link>
      </div>
    </section>
  );
}
