-- 003_add_has_flashcards.sql
-- Adds the `has_flashcards` boolean column to the documents table

BEGIN;

ALTER TABLE IF EXISTS public.documents
  ADD COLUMN IF NOT EXISTS has_flashcards boolean DEFAULT false;

-- Ensure existing rows have a defined value
UPDATE public.documents
  SET has_flashcards = false
  WHERE has_flashcards IS NULL;

COMMIT;

-- Note: run this migration in your Supabase SQL editor or via psql with
-- the service role key. Example (Supabase SQL editor is easiest):
-- 1) Open Supabase dashboard > SQL Editor
-- 2) Paste the contents of this file and run it
