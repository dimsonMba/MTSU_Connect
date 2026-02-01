import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { chatService, ChatConversation } from "@/services/chat.service";
import { Student } from "@/services/student.service";
import { MessageCircle, Users, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";

export default function ChatsListScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);

  const loadConversations = async () => {
    const { data } = await chatService.getConversations();
    if (data) setConversations(data);
  };

  const loadData = async () => {
    setLoading(true);
    await loadConversations();
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (session) {
        loadData();
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session) {
        loadData();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const participantsChannel = supabase
      .channel("chat_participants:presence")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_participants" },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleChatPress = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chat/${chatId}`);
  };

  const handleCreateNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/new-chat");
  };

  const renderChatItem = ({ item }: { item: ChatConversation }) => (
    <Pressable style={styles.chatItem} onPress={() => handleChatPress(item.id)}>
      <View style={styles.chatIcon}>
        {item.is_study_room ? <Users size={24} color={colors.primary} /> : <MessageCircle size={24} color={colors.primary} />}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        {item.last_message && <Text style={styles.lastMessage} numberOfLines={1}>{item.last_message}</Text>}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Pressable style={styles.createButton} onPress={handleCreateNewChat}>
          <Plus size={24} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Pressable onPress={handleCreateNewChat}>
                <Text style={styles.startChatText}>Start a new chat</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 28, fontWeight: "700", color: colors.text },
  createButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  startChatText: { fontSize: 16, color: colors.primary, fontWeight: "600", marginTop: 12 },
  listContent: { paddingVertical: 8 },
  chatItem: { flexDirection: "row", padding: 16, backgroundColor: colors.cardBackground, marginHorizontal: 16, marginVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  chatIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, justifyContent: "center", alignItems: "center", marginRight: 12 },
  chatContent: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  lastMessage: { fontSize: 14, color: colors.textSecondary },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
