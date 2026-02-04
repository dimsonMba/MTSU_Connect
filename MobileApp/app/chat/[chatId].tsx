import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  AppState,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "@/constants/colors";
import { ChatBubble } from "@/components/ChatBubble";
import { chatService, ChatMessage, ChatParticipant } from "@/services/chat.service";
import { ArrowLeft, Send, Paperclip, Users, UserPlus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/contexts/ThemeContext";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [conversationName, setConversationName] = useState("");
  const [conversationSubject, setConversationSubject] = useState("");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showParticipants, setShowParticipants] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/(study)");
    }
  };

  useEffect(() => {
    loadChatData();
    checkMembership();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !isMember) return;

    // Subscribe to new messages
    const messageChannel = chatService.subscribeToMessages(
      chatId as string,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    // Subscribe to participant status changes
    const participantChannel = chatService.subscribeToOnlineStatus(
      chatId as string,
      () => {
        loadParticipants();
      }
    );

    // Update online status
    chatService.updateOnlineStatus(chatId as string, true);

    return () => {
      chatService.updateOnlineStatus(chatId as string, false);
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(participantChannel);
    };
  }, [chatId, isMember]);

  useFocusEffect(
    React.useCallback(() => {
      if (!chatId || !isMember) return;
      chatService.updateOnlineStatus(chatId as string, true);
      return () => {
        chatService.updateOnlineStatus(chatId as string, false);
      };
    }, [chatId, isMember])
  );

  useEffect(() => {
    if (!chatId || !isMember) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        chatService.updateOnlineStatus(chatId as string, true);
      } else {
        chatService.updateOnlineStatus(chatId as string, false);
      }
    });
    return () => subscription.remove();
  }, [chatId, isMember]);

  const checkMembership = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserId(user.id);

    const { data } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("conversation_id", chatId)
      .eq("user_id", user.id)
      .single();

    setIsMember(!!data);
  };

  const loadChatData = async () => {
    setLoading(true);
    
    // Load conversation details
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("name, subject")
      .eq("id", chatId)
      .single();

    if (conv) {
      setConversationName(conv.name);
      setConversationSubject(conv.subject || "");
    }

    await loadParticipants();
    await loadMessages();
    
    setLoading(false);
  };

  const loadParticipants = async () => {
    const { data } = await chatService.getParticipants(chatId as string);
    if (data) {
      setParticipants(data);
    }
  };

  const loadMessages = async () => {
    const { data } = await chatService.getMessages(chatId as string);
    if (data) {
      setMessages(data);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  };

  const handleJoinGroup = async () => {
    setJoining(true);
    const { error } = await chatService.joinConversation(chatId as string);
    
    if (error) {
      Alert.alert("Error", "Failed to join group. Please try again.");
      setJoining(false);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsMember(true);
    setJoining(false);
    loadChatData();
  };

  const handleSend = async () => {
    if (!inputText.trim() || !isMember) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const content = inputText.trim();
    setInputText("");

    const { error } = await chatService.sendMessage(chatId as string, content);

    if (error) {
      Alert.alert("Error", "Failed to send message");
      setInputText(content); // Restore text on error
    }
  };

  const onlineCount = participants.filter((p) => p.is_online).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show join screen if not a member
  if (!isMember) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: conversationName || "Study Group",
            headerLeft: () => (
              <Pressable onPress={handleBack} style={styles.backButton}>
                <ArrowLeft size={22} color={colors.primary} />
              </Pressable>
            ),
          }}
        />
        <View style={styles.joinContainer}>
          <View style={styles.joinIcon}>
            <Users size={48} color={colors.primary} />
          </View>
          <Text style={styles.joinTitle}>{conversationName}</Text>
          {conversationSubject && (
            <Text style={styles.joinSubject}>{conversationSubject}</Text>
          )}
          <View style={styles.joinStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{participants.length}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{onlineCount}</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
          </View>
          <Pressable
            style={[styles.joinButton, joining && styles.joinButtonDisabled]}
            onPress={handleJoinGroup}
            disabled={joining}
          >
            {joining ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <UserPlus size={20} color={colors.white} />
                <Text style={styles.joinButtonText}>Join Study Group</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: conversationName || "Chat",
          headerLeft: () => (
            <Pressable onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={22} color={colors.primary} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable 
              style={styles.headerRight}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowParticipants(true);
              }}
            >
              <View style={styles.participantsBadge}>
                <Users size={14} color={colors.primary} />
                <Text style={styles.participantsText}>
                  {participants.length}
                </Text>
              </View>
              {onlineCount > 0 && (
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>{onlineCount}</Text>
                </View>
              )}
            </Pressable>
          ),
        }}
      />

      {conversationSubject && (
        <View style={styles.roomBanner}>
          <Text style={styles.roomBannerText}>
            📚 Study Room • {conversationSubject}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={{
              id: item.id,
              senderId: item.sender_id,
              senderName: item.sender_name,
              content: item.content,
              timestamp: new Date(item.created_at),
              isOwn: item.sender_id === currentUserId,
            }}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      <View style={styles.inputContainer}>
        <Pressable style={styles.attachButton}>
          <Paperclip size={22} color={colors.textSecondary} />
        </Pressable>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send
            size={20}
            color={inputText.trim() ? colors.white : colors.textMuted}
          />
        </Pressable>
      </View>

      <Modal
        visible={showParticipants}
        transparent
        animationType="slide"
        onRequestClose={() => setShowParticipants(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={() => setShowParticipants(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Members ({participants.length})</Text>
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setShowParticipants(false)}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.participantsList}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantAvatar}>
                    <Text style={styles.participantInitial}>
                      {participant.profile.full_name?.charAt(0).toUpperCase() || "?"}
                    </Text>
                    {participant.is_online && (
                      <View style={styles.participantOnlineDot} />
                    )}
                  </View>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>
                      {participant.profile.full_name || "Unknown User"}
                    </Text>
                    {participant.profile.major && (
                      <Text style={styles.participantMajor}>
                        {participant.profile.major}
                      </Text>
                    )}
                  </View>
                  <View style={[
                    styles.participantStatus,
                    participant.is_online ? styles.statusOnline : styles.statusOffline
                  ]}>
                    <Text style={[
                      styles.participantStatusText,
                      participant.is_online ? styles.statusOnlineText : styles.statusOfflineText
                    ]}>
                      {participant.is_online ? "Online" : "Offline"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  joinContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  joinIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  joinTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  joinSubject: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 32,
  },
  joinStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 24,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  participantsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  participantsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.success,
  },
  roomBanner: {
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.primary,
    textAlign: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  participantsList: {
    padding: 16,
  },
  participantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative" as const,
  },
  participantInitial: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.white,
  },
  participantOnlineDot: {
    position: "absolute" as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  participantMajor: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  participantStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: `${colors.success}15`,
  },
  statusOffline: {
    backgroundColor: `${colors.textMuted}15`,
  },
  participantStatusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusOnlineText: {
    color: colors.success,
  },
  statusOfflineText: {
    color: colors.textMuted,
  },
});
