-- 001_create_documents_table.sql
-- Run this in your Supabase SQL editor or via psql with the service role key.

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  page_count int default 0,
  storage_bucket text,
  storage_path text,
  has_flashcards boolean default false,
  created_at timestamptz default now()
);

-- Example RLS: allow owner exact access
-- Enable row level security
-- ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
-- Create policy to allow users to insert/select/update/delete only their rows
-- CREATE POLICY "users_manage_own_documents" ON public.documents
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
