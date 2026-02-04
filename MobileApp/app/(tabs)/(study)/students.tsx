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
import { studentService, Student } from "@/services/student.service";
import { chatService } from "@/services/chat.service";
import { User, Search, MessageCircle, GraduationCap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";

export default function StudentsListScreen() {
  const router = useRouter();
  const { colors: themeColors } = useTheme();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingChat, setCreatingChat] = useState<string | null>(null);

  const loadStudents = async () => {
    const { data, error } = await studentService.getAllStudents();
    if (data) {
      setStudents(data);
      setFilteredStudents(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = students.filter(
        (student) =>
          student.full_name.toLowerCase().includes(query) ||
          (student.major && student.major.toLowerCase().includes(query))
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const handleChatWithStudent = async (student: Student) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCreatingChat(student.id);

    // Create or get existing direct message conversation
    const { data, error } = await chatService.createOrGetDirectMessage(student.id);

    setCreatingChat(null);

    if (error) {
      Alert.alert("Error", "Failed to start chat. Please try again.");
      return;
    }

    if (data) {
      // Navigate to the chat
      router.push(`/chat/${data.id}`);
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentAvatar}>
        {item.avatar_url ? (
          <View style={styles.avatarPlaceholder}>
            <User size={24} color={colors.primary} />
          </View>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={24} color={colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1}>
          {item.full_name}
        </Text>
        <View style={styles.studentMeta}>
          {item.major && (
            <View style={styles.majorContainer}>
              <GraduationCap size={14} color={colors.textSecondary} />
              <Text style={styles.majorText} numberOfLines={1}>
                {item.major}
              </Text>
            </View>
          )}
          {item.gpa && (
            <Text style={styles.gpaText}>GPA: {item.gpa.toFixed(2)}</Text>
          )}
        </View>
      </View>
      <Pressable
        style={[
          styles.chatButton,
          creatingChat === item.id && styles.chatButtonDisabled,
        ]}
        onPress={() => handleChatWithStudent(item)}
        disabled={creatingChat === item.id}
      >
        {creatingChat === item.id ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <MessageCircle size={20} color={colors.white} />
        )}
      </Pressable>
    </View>
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
        <Text style={styles.headerTitle}>Students</Text>
        <Text style={styles.headerSubtitle}>
          {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchIcon}>
          <Search size={20} color={colors.textSecondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or major..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <User size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No students found" : "No students yet"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try a different search term"
                : "Students will appear here once they sign up"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  studentAvatar: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  studentMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  majorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  majorText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  gpaText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  chatButtonDisabled: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
