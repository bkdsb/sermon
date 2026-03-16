"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BibleVersionSwitcher from "@/components/bible/BibleVersionSwitcher";
import { useAuthUser } from "@/lib/auth/useAuthUser";
import { supabase } from "@/lib/supabaseClient";

export default function AppHeader() {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="mb-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-[0_12px_30px_rgba(27,33,43,0.08)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white shadow-[0_6px_14px_rgba(32,40,53,0.1)]">
              <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
                <path d="M16 4c2.1 1.9 3.2 4 3.2 6.5 0 2.3-1.2 4.2-3.2 5.8-2-1.6-3.2-3.5-3.2-5.8 0-2.5 1.1-4.6 3.2-6.5Z" style={{ fill: "var(--accent-crimson)" }} />
                <path d="M9.4 8.1c1.7 1.3 2.8 2.9 3.2 4.6-.4 1.7-1.5 3.2-3.4 4.3-1.4-1.6-2.2-3.3-2.2-5 0-1.5.8-2.8 2.4-3.9Z" style={{ fill: "var(--accent-olive)" }} />
                <path d="M22.6 8.1c-1.7 1.3-2.8 2.9-3.2 4.6.4 1.7 1.5 3.2 3.4 4.3 1.4-1.6 2.2-3.3 2.2-5 0-1.5-.8-2.8-2.4-3.9Z" style={{ fill: "var(--accent-olive)" }} />
                <rect x="15" y="16.5" width="2" height="8" rx="1" style={{ fill: "var(--accent-gold)" }} />
              </svg>
            </span>

            <span>
              <span className="block text-2xl font-bold tracking-tight text-[var(--primary)] transition group-hover:text-[var(--primary-soft)]">
                SermOn
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Sola Scriptura Workspace</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl border border-[var(--border)] bg-white/80 p-1 text-sm font-semibold md:flex">
            <Link href="/biblia/gn/1" className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-[var(--primary)]">
              Bíblia
            </Link>
            <Link href="/sermoes" className="rounded-lg px-3 py-1.5 text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-[var(--primary)]">
              Sermões
            </Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <BibleVersionSwitcher compact />

          {loading ? (
            <span className="text-xs text-[var(--muted)]">Sessão...</span>
          ) : user ? (
            <>
              <span className="max-w-44 truncate text-xs font-medium text-[var(--muted)]">{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
