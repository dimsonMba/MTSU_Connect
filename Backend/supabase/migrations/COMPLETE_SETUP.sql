-- MTSU Connect: Complete Database Setup for Student-to-Student Chat
-- Run this entire file in your Supabase SQL Editor
-- Make sure to run this AFTER the initial chat system migration

-- ===========================================================================
-- STEP 1: Verify existing tables exist
-- ===========================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'profiles table not found. Please run 20260131_chat_system.sql first';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
    RAISE EXCEPTION 'chat_conversations table not found. Please run 20260131_chat_system.sql first';
  END IF;
  
  RAISE NOTICE '✓ All required tables exist';
END $$;

-- ===========================================================================
-- STEP 2: Add Direct Messages Support
-- ===========================================================================

-- Add comment to clarify direct message support
COMMENT ON COLUMN public.chat_conversations.is_study_room IS 
  'false = direct message between 2 users, true = public study group';

-- Add a helpful function to get the other user in a direct message
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

-- View for direct messages
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
WHERE cc.is_study_room = false
  AND cp.user_id != auth.uid()
  AND EXISTS (
    SELECT 1 FROM chat_participants
    WHERE conversation_id = cc.id
    AND user_id = auth.uid()
  );

-- Grant permissions on the view
GRANT SELECT ON user_direct_messages TO authenticated;

-- ===========================================================================
-- STEP 5: Test Data (Optional - Remove in Production)
-- ===========================================================================

-- Uncomment to add sample profiles for testing
/*
-- Add test profiles (replace UUIDs with actual user IDs from auth.users)
INSERT INTO public.profiles (id, full_name, major, gpa, avatar_url)
VALUES 
  ('user-id-1', 'Alex Johnson', 'Computer Science', 3.75, NULL),
  ('user-id-2', 'Sam Williams', 'Engineering', 3.92, NULL),
  ('user-id-3', 'Jordan Davis', 'Business', 3.65, NULL)
ON CONFLICT (id) DO NOTHING;
*/

-- ===========================================================================
-- STEP 6: Verification Queries
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
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Students can now:';
  RAISE NOTICE '  ✓ View all other students';
  RAISE NOTICE '  ✓ Send direct messages';
  RAISE NOTICE '  ✓ Create/join study groups';
  RAISE NOTICE '  ✓ Search students by name/major';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Ensure your app has EXPO_PUBLIC_SUPABASE_URL set';
  RAISE NOTICE '  2. Ensure your app has EXPO_PUBLIC_SUPABASE_ANON_KEY set';
  RAISE NOTICE '  3. Test the Students screen in your app';
  RAISE NOTICE '  4. Try sending a direct message';
  RAISE NOTICE '';
END $$;
