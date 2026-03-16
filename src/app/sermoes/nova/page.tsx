"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import { useUserNotes } from "@/lib/notes/useUserNotes";

export default function NovoSermaoPage() {
  const router = useRouter();
  const { createNote } = useUserNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Informe um título para continuar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const note = await createNote({
        title: title.trim(),
        content: content.trim()
      });

      router.push(`/sermoes/${note.id}`);
    } catch (saveError) {
      console.error(saveError);
      setError("Não foi possível salvar o sermão. Verifique a sessão no Supabase.");
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <header className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Novo Sermão</h1>
      </header>

      <div className="space-y-3">
        <label htmlFor="sermao-title" className="text-sm font-semibold text-[var(--muted)]">
          Título
        </label>
        <input
          id="sermao-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex.: Esperança em Romanos 5"
          className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
        />
      </div>

      <NoteEditor value={content} onChange={setContent} />

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar sermão"}
        </button>
      </div>
    </section>
  );
}
