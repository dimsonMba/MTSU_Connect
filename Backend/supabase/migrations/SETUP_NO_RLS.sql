-- MTSU Connect: Student Chat Setup (WITHOUT RLS for development)
-- Run this in your Supabase SQL Editor
-- WARNING: This disables Row Level Security - use for development only!

-- ===========================================================================
-- STEP 1: Disable RLS on all tables (for development)
-- ===========================================================================
ALTER TABLE public.chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view public study rooms" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can update their own participant record" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- ===========================================================================
-- STEP 2: Add Direct Messages Support
-- ===========================================================================

-- Add comment to clarify direct message support
COMMENT ON COLUMN public.chat_conversations.is_study_room IS 
  'false = direct message between 2 users, true = public study group';

-- Helper function to get the other user in a direct message
CREATE OR REPLACE FUNCTION get_dm_other_user(conversation_uuid UUID)
RETURNS UUID AS $$
DECLARE
  current_user_id UUID;
  other_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Get the other participant (not current user)
  SELECT user_id INTO other_user_id
  FROM public.chat_participants
  WHERE conversation_id = conversation_uuid
    AND user_id != current_user_id
  LIMIT 1;
  
  RETURN other_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================================================
-- STEP 3: Add Performance Indexes
-- ===========================================================================

-- Index for better performance when finding existing DMs
CREATE INDEX IF NOT EXISTS idx_chat_conversations_study_room 
  ON public.chat_conversations(is_study_room);

-- Ensure the profiles table has an index on full_name for searching
CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
  ON public.profiles(full_name);

-- Index for major search
CREATE INDEX IF NOT EXISTS idx_profiles_major 
  ON public.profiles(major);

-- ===========================================================================
-- STEP 4: Create Helpful Views
-- ===========================================================================

-- View for direct messages (without RLS filter)
CREATE OR REPLACE VIEW user_direct_messages AS
SELECT 
  cc.id as conversation_id,
  cc.name,
  cc.created_at,
  cc.updated_at,
  cp.user_id as participant_id,
  p.full_name as participant_name,
  p.avatar_url as participant_avatar,
  p.major as participant_major
FROM chat_conversations cc
JOIN chat_participants cp ON cp.conversation_id = cc.id
JOIN profiles p ON p.id = cp.user_id
WHERE cc.is_study_room = false;

-- Grant permissions on the view
GRANT SELECT ON user_direct_messages TO authenticated;
GRANT SELECT ON user_direct_messages TO anon;

-- ===========================================================================
-- STEP 5: Verification
-- ===========================================================================

-- Check profiles count
DO $$
DECLARE
  profile_count INT;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  RAISE NOTICE '✓ Total profiles: %', profile_count;
END $$;

-- Check chat conversations
DO $$
DECLARE
  dm_count INT;
  study_room_count INT;
BEGIN
  SELECT COUNT(*) INTO dm_count FROM public.chat_conversations WHERE is_study_room = false;
  SELECT COUNT(*) INTO study_room_count FROM public.chat_conversations WHERE is_study_room = true;
  RAISE NOTICE '✓ Direct Messages: %', dm_count;
  RAISE NOTICE '✓ Study Rooms: %', study_room_count;
END $$;

-- ===========================================================================
-- COMPLETION MESSAGE
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Setup Complete! ✓';
  RAISE NOTICE 'RLS DISABLED (Development Mode)';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Students can now:';
  RAISE NOTICE '  ✓ View all other students';
  RAISE NOTICE '  ✓ Send direct messages';
  RAISE NOTICE '  ✓ Create/join study groups';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: RLS is DISABLED';
  RAISE NOTICE '   All tables are accessible without restrictions';
  RAISE NOTICE '   Enable RLS before going to production!';
  RAISE NOTICE '';
END $$;
