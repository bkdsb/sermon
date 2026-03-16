import Link from "next/link";
import type { UserNote } from "@/lib/notes/useUserNotes";

interface NoteListItemProps {
  note: UserNote;
}

export default function NoteListItem({ note }: NoteListItemProps) {
  const preview = note.content.length > 160 ? `${note.content.slice(0, 160)}...` : note.content;

  return (
    <li>
      <Link
        href={`/sermoes/${note.id}`}
        className="block rounded-xl border border-[var(--border)] bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base font-semibold text-[var(--foreground)]">{note.title}</h3>
          <span className="text-xs text-[var(--muted)]">{new Date(note.updated_at).toLocaleString("pt-BR")}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{preview}</p>
      </Link>
    </li>
  );
}
