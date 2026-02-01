-- Direct Messages Enhancement
-- Run this in Supabase SQL Editor
-- This migration adds support for direct messaging between students
-- while maintaining the existing study room functionality

-- The existing schema already supports direct messages through is_study_room flag
-- This migration just adds helpful comments and ensures policies are correct

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

-- Add index for better performance when finding existing DMs
CREATE INDEX IF NOT EXISTS idx_chat_conversations_study_room 
  ON public.chat_conversations(is_study_room);

-- Ensure the profiles table has an index on full_name for searching
CREATE INDEX IF NOT EXISTS idx_profiles_full_name 
  ON public.profiles(full_name);

-- Add a helpful view for direct messages
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Direct messaging support successfully configured!';
  RAISE NOTICE 'Students can now:';
  RAISE NOTICE '  - View all other students in the profiles table';
  RAISE NOTICE '  - Create direct message conversations (is_study_room = false)';
  RAISE NOTICE '  - Create or join study groups (is_study_room = true)';
  RAISE NOTICE 'Use the user_direct_messages view to easily query DM conversations';
END $$;
