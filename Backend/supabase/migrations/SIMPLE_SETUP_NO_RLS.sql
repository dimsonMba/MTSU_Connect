-- MTSU Connect: Simple Setup WITHOUT RLS (For Development/Testing)
-- Run this entire file in your Supabase SQL Editor
-- WARNING: This disables security - use only for development!

-- ===========================================================================
-- STEP 1: Create Tables
-- ===========================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  major TEXT,
  gpa DECIMAL(3,2),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_study_room BOOLEAN DEFAULT false,
  subject TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat participants table (many-to-many)
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- STEP 2: DISABLE RLS (Development Only!)
-- ===========================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies
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
-- STEP 3: Add Performance Indexes
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation ON public.chat_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_study_room ON public.chat_conversations(is_study_room);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);
CREATE INDEX IF NOT EXISTS idx_profiles_major ON public.profiles(major);

-- ===========================================================================
-- STEP 4: Create Helper Functions
-- ===========================================================================

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update conversation's updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON public.chat_messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- ===========================================================================
-- STEP 5: Add Sample Data (Optional - Uncomment to add test users)
-- ===========================================================================

/*
-- First, create test users in Supabase Auth dashboard, then add their profiles:
INSERT INTO public.profiles (id, full_name, major, gpa)
VALUES 
  ('user-uuid-1', 'Alex Johnson', 'Computer Science', 3.75),
  ('user-uuid-2', 'Sam Williams', 'Engineering', 3.92),
  ('user-uuid-3', 'Jordan Davis', 'Business Administration', 3.65),
  ('user-uuid-4', 'Taylor Martinez', 'Biology', 3.88)
ON CONFLICT (id) DO NOTHING;
*/

-- ===========================================================================
-- STEP 6: Enable Realtime
-- ===========================================================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

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
  RAISE NOTICE '⚠️  WARNING: RLS is DISABLED for development';
  RAISE NOTICE '   All data is publicly accessible!';
  RAISE NOTICE '   Enable RLS before production deployment.';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to use:';
  RAISE NOTICE '  ✓ Profiles table';
  RAISE NOTICE '  ✓ Chat conversations';
  RAISE NOTICE '  ✓ Direct messages';
  RAISE NOTICE '  ✓ Study groups';
  RAISE NOTICE '  ✓ Real-time messaging';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Start your app with `npx expo start`';
  RAISE NOTICE '';
END $$;
