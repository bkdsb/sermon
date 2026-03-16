"use client";

import Link from "next/link";
import NoteListItem from "@/components/notes/NoteListItem";
import { useUserNotes } from "@/lib/notes/useUserNotes";

export default function SermoesPage() {
  const { notes, loading } = useUserNotes();

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Meus Sermões</h1>
        <Link
          href="/sermoes/nova"
          className="inline-flex items-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Novo sermão
        </Link>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando sermões...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Nenhum sermão ainda. Crie o primeiro em “Novo sermão”.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <NoteListItem key={note.id} note={note} />
          ))}
        </ul>
      )}
    </section>
  );
}
