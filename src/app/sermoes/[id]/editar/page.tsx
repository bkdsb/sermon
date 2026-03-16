"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import { supabase } from "@/lib/supabaseClient";
import { useUserNotes } from "@/lib/notes/useUserNotes";

export default function EditarSermaoPage() {
  const params = useParams<{ id: string }>();
  const noteId = params.id;
  const router = useRouter();
  const { updateNote } = useUserNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    const loadNote = async () => {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from("notes")
        .select("id,title,content")
        .eq("id", noteId)
        .single();

      if (queryError) {
        console.error(queryError);
        setError("Não foi possível carregar este sermão para edição.");
      } else {
        setTitle(data.title);
        setContent(data.content);
      }

      setLoading(false);
    };

    void loadNote();
  }, [noteId]);

  const handleSave = async () => {
    if (!noteId) return;
    if (!title.trim()) {
      setError("Informe um título para continuar.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateNote(noteId, {
        title: title.trim(),
        content: content.trim()
      });
      router.push(`/sermoes/${noteId}`);
    } catch (updateError) {
      console.error(updateError);
      setError("Falha ao atualizar o sermão.");
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <header className="border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-bold text-[var(--primary)]">Editar Sermão</h1>
      </header>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Carregando dados...</p>
      ) : (
        <>
          <div className="space-y-3">
            <label htmlFor="sermao-title-edit" className="text-sm font-semibold text-[var(--muted)]">
              Título
            </label>
            <input
              id="sermao-title-edit"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
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
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
