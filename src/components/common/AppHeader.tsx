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
    <header className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-[var(--primary)]">
            SermOn
          </Link>

          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link href="/biblia/jo/1" className="rounded-md px-3 py-2 hover:bg-black/5">
              Bíblia
            </Link>
            <Link href="/sermoes" className="rounded-md px-3 py-2 hover:bg-black/5">
              Sermões
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <BibleVersionSwitcher compact />

          {loading ? (
            <span className="text-xs text-[var(--muted)]">Sessão...</span>
          ) : user ? (
            <>
              <span className="max-w-44 truncate text-xs text-[var(--muted)]">{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5"
              >
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
