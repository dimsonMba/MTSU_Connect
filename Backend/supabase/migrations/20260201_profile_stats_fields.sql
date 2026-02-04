-- Add profile fields for permit and stats
-- Run this in Supabase SQL Editor

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'permit_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN permit_type TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'credits'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN credits INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'flashcard_sets'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN flashcard_sets INTEGER DEFAULT 0;
  END IF;
END $$;
