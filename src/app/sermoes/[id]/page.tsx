"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import RefTag from "@/components/common/RefTag";
import { supabase } from "@/lib/supabaseClient";
import type { BibleVerseId } from "@/lib/bible/types";
import type { UserNote } from "@/lib/notes/useUserNotes";

const REFERENCE_PATTERN = /\[([a-z0-9]+\.\d+\.\d+)\]/gi;

function renderLineWithReferences(line: string, lineIndex: number) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const matcher = new RegExp(REFERENCE_PATTERN);
  let match = matcher.exec(line);

  while (match) {
    const [rawRef, id] = match;
    const start = match.index;

    if (start > cursor) {
      nodes.push(line.slice(cursor, start));
    }

    nodes.push(<RefTag key={`${lineIndex}-${start}-${id}`} verseRef={id as BibleVerseId} />);
    cursor = start + rawRef.length;
    match = matcher.exec(line);
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  if (nodes.length === 0) {
    nodes.push(line);
  }

  return (
    <p key={`line-${lineIndex}`} className="mb-2 leading-7">
      {nodes.map((node, index) => (
        <span key={`node-${lineIndex}-${index}`} className="mr-1 inline">
          {node}
        </span>
      ))}
    </p>
  );
}

export default function SermaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const noteId = params.id;

  const [note, setNote] = useState<UserNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    const loadNote = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sessão expirada. Faça login novamente.");
        setNote(null);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("notes")
        .select("id,user_id,title,content,created_at,updated_at")
        .eq("id", noteId)
        .eq("user_id", user.id)
        .single();

      if (queryError) {
        console.error(queryError);
        setError("Não foi possível carregar este sermão.");
        setNote(null);
      } else {
        setNote(data as UserNote);
      }

      setLoading(false);
    };

    void loadNote();
  }, [noteId]);

  const renderedContent = useMemo(() => {
    if (!note) return null;
    return note.content.split("\n").map((line, index) => renderLineWithReferences(line, index));
  }, [note]);

  return (
    <AuthGuard>
      <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_12px_28px_rgba(28,35,46,0.08)]">
        {loading ? <p className="text-sm text-[var(--muted)]">Carregando sermão...</p> : null}

        {!loading && error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        {!loading && note ? (
          <>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--primary)]">{note.title}</h1>
                <p className="mt-1 text-xs text-[var(--muted)]">Atualizado em {new Date(note.updated_at).toLocaleString("pt-BR")}</p>
              </div>
              <Link
                href={`/sermoes/${note.id}/editar`}
                className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5"
              >
                Editar
              </Link>
            </header>

            <article className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--foreground)]">{renderedContent}</article>
          </>
        ) : null}
      </section>
    </AuthGuard>
  );
}
