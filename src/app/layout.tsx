import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SermOn",
  description: "Estudo bíblico e criação de sermões com referências cruzadas."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
          <header className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="text-2xl font-semibold tracking-tight text-[var(--primary)]">
                SermOn
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/biblia/jo/11" className="rounded-md px-3 py-2 hover:bg-black/5">
                  Bíblia
                </Link>
                <Link href="/sermoes" className="rounded-md px-3 py-2 hover:bg-black/5">
                  Sermões
                </Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
