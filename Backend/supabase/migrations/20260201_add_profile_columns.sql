-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor

-- Add major column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'major'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN major TEXT;
  END IF;
END $$;

-- Add gpa column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'gpa'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gpa DECIMAL(3,2);
  END IF;
END $$;

-- Add year column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'year'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN year TEXT;
  END IF;
END $$;

-- Add is_online column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_online'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_online BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add last_seen column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;
