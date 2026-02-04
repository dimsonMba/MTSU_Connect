import { supabase } from "@/lib/supabase";

export interface ChatConversation {
  id: string;
  name: string;
  is_study_room: boolean;
  subject?: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  online_count: number;
  last_message?: string;
  last_message_time?: string;
}

export interface ChatParticipant {
  id: string;
  user_id: string;
  is_online: boolean;
  last_seen: string;
  profile: {
    full_name: string;
    avatar_url?: string;
    major?: string;
  };
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
}

class ChatService {
  // Get all conversations for current user
  async getConversations(): Promise<{ data: ChatConversation[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    // First, get conversation IDs where user is a participant
    const { data: userConvs, error: convError } = await supabase
      .from("chat_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (convError) return { data: null, error: convError };

    const conversationIds = userConvs?.map((c) => c.conversation_id) || [];
    if (conversationIds.length === 0) return { data: [], error: null };

    // Then get all details for those conversations, including ALL participants
    const { data, error } = await supabase
      .from("chat_conversations")
      .select(`
        *,
        chat_participants(user_id, is_online),
        chat_messages(content, created_at)
      `)
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (error) return { data: null, error };

    // Transform data to include counts and last message
    const conversations = data?.map((conv: any) => {
      const participants = conv.chat_participants || [];
      const messages = conv.chat_messages || [];
      const lastMessage = messages.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: conv.id,
        name: conv.name,
        is_study_room: conv.is_study_room,
        subject: conv.subject,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participant_count: participants.length,
        online_count: participants.filter((p: any) => p.is_online).length,
        last_message: lastMessage?.content,
        last_message_time: lastMessage?.created_at,
      };
    }) || [];

    return { data: conversations, error: null };
  }

  // Get all available study groups (public discovery)
  async getAllStudyGroups(): Promise<{ data: ChatConversation[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("chat_conversations")
      .select(`
        *,
        chat_participants(user_id, is_online),
        chat_messages(content, created_at)
      `)
      .eq("is_study_room", true)
      .order("updated_at", { ascending: false });

    if (error) return { data: null, error };

    // Transform data and filter out groups user is already in
    const conversations = data?.map((conv: any) => {
      const participants = conv.chat_participants || [];
      const messages = conv.chat_messages || [];
      const lastMessage = messages.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return {
        id: conv.id,
        name: conv.name,
        is_study_room: conv.is_study_room,
        subject: conv.subject,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        participant_count: participants.length,
        online_count: participants.filter((p: any) => p.is_online).length,
        last_message: lastMessage?.content,
        last_message_time: lastMessage?.created_at,
        is_member: participants.some((p: any) => p.user_id === user.id),
      };
    }).filter((conv: any) => !conv.is_member) || [];

    return { data: conversations, error: null };
  }

  // Get participants in a conversation
  async getParticipants(conversationId: string): Promise<{ data: ChatParticipant[] | null; error: any }> {
    const { data: participantRows, error } = await supabase
      .from("chat_participants")
      .select("id, user_id, is_online, last_seen")
      .eq("conversation_id", conversationId);

    if (error) return { data: null, error };

    const userIds = Array.from(
      new Set((participantRows || []).map((p: any) => p.user_id).filter(Boolean)),
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, major")
      .in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileById = new Map(
      (profiles || []).map((p: any) => [
        p.id,
        { full_name: p.full_name, avatar_url: p.avatar_url, major: p.major },
      ]),
    );

    const participants = (participantRows || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      is_online: p.is_online,
      last_seen: p.last_seen,
      profile: profileById.get(p.user_id) || { full_name: "Unknown" },
    }));

    return { data: participants, error: null };
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<{ data: ChatMessage[] | null; error: any }> {
    const { data: messageRows, error } = await supabase
      .from("chat_messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) return { data: null, error };

    const senderIds = Array.from(
      new Set((messageRows || []).map((m: any) => m.sender_id).filter(Boolean)),
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", senderIds.length ? senderIds : ["00000000-0000-0000-0000-000000000000"]);

    const profileById = new Map(
      (profiles || []).map((p: any) => [
        p.id,
        { full_name: p.full_name, avatar_url: p.avatar_url },
      ]),
    );

    const messages = (messageRows || []).map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      content: m.content,
      created_at: m.created_at,
      sender_name: profileById.get(m.sender_id)?.full_name || "Unknown",
      sender_avatar: profileById.get(m.sender_id)?.avatar_url,
    }));

    return { data: messages, error: null };
  }

  // Send a message
  async sendMessage(conversationId: string, content: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });

    return { error };
  }

  // Create a new conversation
  async createConversation(name: string, isStudyRoom: boolean, subject?: string): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data: conversation, error: convError } = await supabase
      .from("chat_conversations")
      .insert({
        name,
        is_study_room: isStudyRoom,
        subject,
        created_by: user.id,
      })
      .select()
      .single();

    if (convError) return { data: null, error: convError };

    // Add creator as participant
    const { error: partError } = await supabase
      .from("chat_participants")
      .insert({
        conversation_id: conversation.id,
        user_id: user.id,
        is_online: true,
      });

    if (partError) return { data: null, error: partError };

    return { data: conversation, error: null };
  }

  // Create or get existing direct message conversation with another student
  async createOrGetDirectMessage(otherUserId: string): Promise<{ data: any; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .rpc("create_or_get_direct_message", { other_user_id: otherUserId });

    if (error) return { data: null, error };

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { data: null, error: "Failed to create or get conversation" };

    return {
      data: { id: row.conversation_id, name: row.conversation_name },
      error: null,
    };
  }

  // Join a conversation
  async joinConversation(conversationId: string): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("chat_participants")
      .upsert({
        conversation_id: conversationId,
        user_id: user.id,
        is_online: true,
      }, { onConflict: "conversation_id,user_id" });

    return { error };
  }

  // Update online status
  async updateOnlineStatus(conversationId: string, isOnline: boolean): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("chat_participants")
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    return { error };
  }

  // Subscribe to new messages in a conversation (real-time)
  subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", payload.new.sender_id)
            .single();

          const message: ChatMessage = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_name: profile?.full_name || "Unknown",
            // sender_avatar: profile?.avatar_url, // removed due to missing column
          };

          callback(message);
        }
      )
      .subscribe();
  }

  // Subscribe to online status changes (real-time)
  subscribeToOnlineStatus(conversationId: string, callback: (participants: any) => void) {
    return supabase
      .channel(`participants:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_participants",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  }
}

export const chatService = new ChatService();
