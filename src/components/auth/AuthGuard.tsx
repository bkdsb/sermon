"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/lib/auth/useAuthUser";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return <p className="text-sm text-[var(--muted)]">Verificando sessão...</p>;
  }

  return <>{children}</>;
}
