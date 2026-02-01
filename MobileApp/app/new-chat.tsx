import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { Search, User, ChevronLeft, MessageCircle, X } from "lucide-react-native";
import { studentService, Student } from "@/services/student.service";
import { chatService } from "@/services/chat.service";
import { supabase } from "@/lib/supabase";
import * as Haptics from "expo-haptics";

export default function NewChatScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingChatId, setCreatingChatId] = useState<string | null>(null);

  // Online status helper
  const onlineWindowMs = 2 * 60 * 1000;
  const isStudentOnline = (student: Student) => {
    if (student.is_online) return true;
    if (!student.last_seen) return false;
    const lastSeenMs = new Date(student.last_seen).getTime();
    return !Number.isNaN(lastSeenMs) && Date.now() - lastSeenMs <= onlineWindowMs;
  };

  useEffect(() => {
    loadStudents();

    // Subscribe to presence updates
    const channel = supabase
      .channel("new_chat_presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new as any;
          setStudents((prev) =>
            prev.map((student) =>
              student.id === updated.id
                ? { ...student, is_online: updated.is_online, last_seen: updated.last_seen }
                : student
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter((student) => {
        const name = student.full_name || "";
        const major = student.major || "";
        return (
          name.toLowerCase().includes(query) || 
          major.toLowerCase().includes(query)
        );
      });
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const loadStudents = async () => {
    // Only set loading on initial load, not on refresh
    if (!refreshing) setLoading(true);
    
    const { data, error } = await studentService.getAllStudents();
    
    if (error) {
      console.error("Error loading students:", error);
      // Optional: Alert.alert("Error", "Failed to load students");
    }

    if (data) {
      console.log(`Loaded ${data.length} students`);
      // Sort alphabetically
      const sorted = [...data].sort((a, b) => 
        (a.full_name || "").localeCompare(b.full_name || "")
      );
      setStudents(sorted);
      setFilteredStudents(sorted);
    } else {
      setStudents([]);
      setFilteredStudents([]);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const handleStartChat = async (student: Student) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreatingChatId(student.id);

    const { data, error } = await chatService.createOrGetDirectMessage(student.id);
    setCreatingChatId(null);

    if (error) {
      console.error("Error creating chat:", error);
      return;
    }

    if (data) {
        // Closes the modal and navigates to the chat
        // We go back first to close modal, then push chat
        // Actually since we are in a modal stack, we can just replace or push?
        // Usually replacing within the modal stack keeps it a modal.
        // Better pattern: Dismiss modal, then push chat on root stack. Use router.dismiss() then push.
        // But for now, let's try pushing directly on top.
        // Or using 'replace' if we want this screen to go away.
      if (router.canGoBack()) {
          router.back();
      }
      // Small delay to let modal close animation start
      setTimeout(() => {
          router.push(`/chat/${data.id}`);
      }, 100);
    }
  };

  const onlineStudents = students.filter(isStudentOnline);

  const renderStudentItem = ({ item }: { item: Student }) => (
    <Pressable
      style={styles.studentItem}
      onPress={() => handleStartChat(item)}
      disabled={!!creatingChatId}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <User size={24} color={colors.primary} />
        </View>
        {isStudentOnline(item) && <View style={styles.onlineBadgeList} />}
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.full_name || "Unknown Student"}</Text>
        <Text style={styles.studentMajor}>{item.major || "Student"}</Text>
      </View>
      {creatingChatId === item.id ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <MessageCircle size={20} color={colors.primary} />
      )}
    </Pressable>
  );

  const renderOnlineUser = ({ item }: { item: Student }) => (
    <Pressable
      style={styles.onlineUserItem}
      onPress={() => handleStartChat(item)}
      disabled={!!creatingChatId}
    >
      <View style={styles.onlineAvatarContainer}>
        <View style={styles.onlineAvatar}>
          <User size={24} color={colors.white} />
        </View>
        <View style={styles.onlineBadgeLarge} />
      </View>
      <Text style={styles.onlineUserName} numberOfLines={1}>
        {(item.full_name || "User").split(" ")[0]}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Message</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for people..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
                <X size={18} color={colors.textSecondary} />
            </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {onlineStudents.length > 0 && searchQuery === "" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Now</Text>
              <FlatList
                horizontal
                data={onlineStudents}
                renderItem={renderOnlineUser}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.onlineList}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All People</Text>
            {students.length === 0 ? (
               <View style={styles.emptyResults}>
                   <Text style={styles.emptyText}>No other students found.</Text>
                   <Text style={styles.emptySubtext}>Invite your friends to join!</Text>
               </View>
            ) : filteredStudents.length === 0 ? (
                <View style={styles.emptyResults}>
                     <Text style={styles.emptyText}>No people found matching "{searchQuery}"</Text>
                </View>
            ) : (
                filteredStudents.map((student) => (
                    <View key={student.id}>
                        {renderStudentItem({ item: student })}
                    </View>
                ))
            )}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  closeButton: { padding: 4 },
  closeText: { fontSize: 16, fontWeight: "600", color: colors.primary },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginLeft: 16,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  onlineList: { paddingHorizontal: 16, gap: 16 },
  onlineUserItem: { alignItems: "center", width: 64 },
  onlineAvatarContainer: { position: "relative", marginBottom: 6 },
  onlineAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadgeLarge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: colors.background,
  },
  onlineUserName: { fontSize: 12, color: colors.text, fontWeight: "500", textAlign: "center" },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.background,
  },
  avatarContainer: { position: "relative", marginRight: 16 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadgeList: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: colors.background,
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "600", color: colors.text },
  studentMajor: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  emptyResults: {
      padding: 32,
      alignItems: "center",
  },
  emptyText: {
      color: colors.textSecondary,
      textAlign: "center",
      fontSize: 15,
      fontWeight: "500",
  },
  emptySubtext: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  }
});
