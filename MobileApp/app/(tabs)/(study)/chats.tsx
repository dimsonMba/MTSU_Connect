import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { chatService, ChatConversation } from "@/services/chat.service";
import { studentService, Student } from "@/services/student.service";
import { MessageCircle, Users, Plus, User, Search } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { CreateChatModal } from "@/components/CreateChatModal";
import { supabase } from "@/lib/supabase";

type TabType = "people" | "chats";

export default function ChatsListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("chats");
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingChat, setCreatingChat] = useState<string | null>(null);

  const loadConversations = async () => {
    const { data } = await chatService.getConversations();
    if (data) setConversations(data);
  };

  const loadStudents = async () => {
    const { data } = await studentService.getAllStudents();
    if (data) {
      setStudents(data);
      setFilteredStudents(data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadConversations(), loadStudents()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("profiles:presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: any) => {
          const updated = (payload &&
            ((payload as any).new ?? (payload as any).record)) as any;
          if (!updated) return;
          setStudents((prev) =>
            prev.map((student) =>
              student.id === updated.id
                ? {
                    ...student,
                    is_online: updated.is_online,
                    last_seen: updated.last_seen,
                  }
                : student,
            ),
          );
        },
      )
      .subscribe();

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
      supabase.removeChannel(channel);
      supabase.removeChannel(participantsChannel);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.full_name.toLowerCase().includes(query) ||
          (student.major && student.major.toLowerCase().includes(query)),
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleChatPress = (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chat/${chatId}`);
  };

  const handleChatWithStudent = async (student: Student) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreatingChat(student.id);

    const { data, error } = await chatService.createOrGetDirectMessage(
      student.id,
    );
    setCreatingChat(null);
    
    if (error || !data) {
      Alert.alert("Error", "Failed to start chat");
      return;
    }

    router.push(`/chat/${data.id}`);
  };

  const onlineCount = filteredStudents.filter(
    (student) => student.is_online,
  ).length;

  const renderStudentItem = ({ item }: { item: Student }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() => handleChatWithStudent(item)}
      disabled={creatingChat === item.id}
    >
      <View style={styles.chatIcon}>
        <User size={24} color={colors.primary} />
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.full_name}</Text>
        {item.major && <Text style={styles.chatSubject}>{item.major}</Text>}
        {item.gpa && (
          <Text style={styles.lastMessage}>GPA: {item.gpa.toFixed(2)}</Text>
        )}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              item.is_online ? styles.statusDotOnline : styles.statusDotOffline,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              item.is_online
                ? styles.statusTextOnline
                : styles.statusTextOffline,
            ]}
          >
            {item.is_online ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
      {creatingChat === item.id ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <MessageCircle size={20} color={colors.primary} />
      )}
    </Pressable>
  );

  const renderChatItem = ({ item }: { item: ChatConversation }) => (
    <Pressable style={styles.chatItem} onPress={() => handleChatPress(item.id)}>
      <View style={styles.chatIcon}>
        {item.is_study_room ? (
          <Users size={24} color={colors.primary} />
        ) : (
          <MessageCircle size={24} color={colors.primary} />
        )}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.name}</Text>
        {item.last_message && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message}
          </Text>
        )}
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
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "people" && styles.tabActive]}
          onPress={() => setActiveTab("people")}
        >
          <User
            size={18}
            color={
              activeTab === "people" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "people" && styles.tabTextActive,
            ]}
          >
            All People ({filteredStudents.length}) • Online {onlineCount}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "chats" && styles.tabActive]}
          onPress={() => setActiveTab("chats")}
        >
          <MessageCircle
            size={18}
            color={
              activeTab === "chats" ? colors.primary : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "chats" && styles.tabTextActive,
            ]}
          >
            My Chats ({conversations.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === "people" && (
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <FlatList
        data={
          activeTab === "people"
            ? (filteredStudents as any)
            : (conversations as any)
        }
        renderItem={
          activeTab === "people"
            ? (renderStudentItem as any)
            : (renderChatItem as any)
        }
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "people" ? "No students found" : "No chats yet"}
            </Text>
          </View>
        }
      />

      <CreateChatModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: colors.text },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: { flexDirection: "row", padding: 16, gap: 8 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  tabText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    marginLeft: 8,
  },
  listContent: { paddingVertical: 8 },
  chatItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatContent: { flex: 1 },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  chatSubject: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 4,
  },
  lastMessage: { fontSize: 14, color: colors.textSecondary },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotOnline: { backgroundColor: "#22c55e" },
  statusDotOffline: { backgroundColor: colors.textMuted },
  statusText: { fontSize: 12, fontWeight: "600" },
  statusTextOnline: { color: "#16a34a" },
  statusTextOffline: { color: colors.textSecondary },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
});
