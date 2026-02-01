-- 004_enable_rls_documents.sql
-- Enable Row Level Security (RLS) on documents and create policies so
-- authenticated users can manage their own rows.

BEGIN;

-- Enable RLS
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT their own documents
CREATE POLICY IF NOT EXISTS "select_own_documents" ON public.documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to INSERT documents where user_id = auth.uid()
CREATE POLICY IF NOT EXISTS "insert_own_documents" ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to UPDATE their own documents
CREATE POLICY IF NOT EXISTS "update_own_documents" ON public.documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to DELETE their own documents
CREATE POLICY IF NOT EXISTS "delete_own_documents" ON public.documents
  FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- Notes:
-- 1) Run this migration in the Supabase SQL editor (recommended) using a
--    project role that can modify policies (service role or owner).
-- 2) After applying, clients must be authenticated (via supabase.auth.signIn/SignUp)
--    to access `documents`. The policies rely on `auth.uid()` which is provided
--    by Supabase's Postgres JWT-based auth when requests come through the
--    Supabase client with a valid session.
