-- Add global presence fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

UPDATE public.profiles
SET
  is_online = COALESCE(is_online, false),
  last_seen = COALESCE(last_seen, NOW());

CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles(is_online);
