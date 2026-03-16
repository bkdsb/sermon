create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table note_verses (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references notes(id) on delete cascade,
  ref text not null
);

alter table notes enable row level security;
alter table note_verses enable row level security;

create policy "user_owns_notes"
on notes for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_owns_note_verses"
on note_verses for all
to authenticated
using (
  exists (
    select 1 from notes n
    where n.id = note_verses.note_id
      and n.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from notes n
    where n.id = note_verses.note_id
      and n.user_id = auth.uid()
  )
);
