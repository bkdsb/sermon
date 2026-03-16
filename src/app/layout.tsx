import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppHeader from "@/components/common/AppHeader";
import { BibleVersionProvider } from "@/lib/bible/BibleVersionContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "SermOn",
  description: "Estudo bíblico e criação de sermões com referências cruzadas."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <BibleVersionProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-8">
            <AppHeader />
            <main className="flex-1">{children}</main>
          </div>
        </BibleVersionProvider>
      </body>
    </html>
  );
}
