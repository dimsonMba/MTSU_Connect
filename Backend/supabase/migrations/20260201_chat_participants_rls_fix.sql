-- Allow conversation creators to add other participants (needed for DM RPC)
-- Run this in Supabase SQL Editor

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can join conversations" ON public.chat_participants;

CREATE POLICY "Users can join conversations"
  ON public.chat_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT created_by
      FROM public.chat_conversations
      WHERE chat_conversations.id = chat_participants.conversation_id
    )
  );
