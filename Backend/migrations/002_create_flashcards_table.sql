-- 002_create_flashcards_table.sql
-- Creates a basic flashcards table associated with documents

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamptz default now()
);

-- Example index for faster queries by document
create index if not exists idx_flashcards_document_id on public.flashcards(document_id);
