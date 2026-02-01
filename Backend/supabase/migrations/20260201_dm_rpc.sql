-- Create RPC to create or get a direct message conversation
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_or_get_direct_message(other_user_id UUID)
RETURNS TABLE (conversation_id UUID, conversation_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  existing_id UUID;
  other_name TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF other_user_id IS NULL OR other_user_id = current_user_id THEN
    RAISE EXCEPTION 'Invalid other user';
  END IF;

  SELECT cp1.conversation_id
  INTO existing_id
  FROM public.chat_participants cp1
  JOIN public.chat_participants cp2
    ON cp1.conversation_id = cp2.conversation_id
  JOIN public.chat_conversations cc
    ON cc.id = cp1.conversation_id
  WHERE cp1.user_id = current_user_id
    AND cp2.user_id = other_user_id
    AND cc.is_study_room = false
  GROUP BY cp1.conversation_id
  HAVING COUNT(*) = 2
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    SELECT name INTO conversation_name FROM public.chat_conversations WHERE id = existing_id;
    conversation_id := existing_id;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT full_name INTO other_name FROM public.profiles WHERE id = other_user_id;
  IF other_name IS NULL THEN
    other_name := 'Direct Message';
  END IF;

  INSERT INTO public.chat_conversations (name, is_study_room, created_by)
  VALUES (other_name, false, current_user_id)
  RETURNING id INTO existing_id;

  INSERT INTO public.chat_participants (conversation_id, user_id, is_online)
  VALUES
    (existing_id, current_user_id, true),
    (existing_id, other_user_id, false);

  conversation_id := existing_id;
  conversation_name := other_name;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_or_get_direct_message(UUID) TO authenticated;
