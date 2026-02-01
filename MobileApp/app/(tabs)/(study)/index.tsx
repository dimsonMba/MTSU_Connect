import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/colors";
import { PDFCard } from "@/components/PDFCard";
import { StudyPartnerCard } from "@/components/StudyPartnerCard";
import { AIProgressOverlay } from "@/components/AIProgressOverlay";
import { mockPDFs, mockStudyPartners } from "@/mocks/data";
import {
  Search,
  Upload,
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  MessageCircle,
  Users,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

type SearchMode = "pdfs" | "scholar";

export default function StudyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("pdfs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfs, setPdfs] = useState(mockPDFs);

  const handleGenerateFlashcards = (documentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setPdfs((prev) =>
        prev.map((pdf) =>
          pdf.id === documentId ? { ...pdf, hasFlashcards: true } : pdf,
        ),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/flashcards/${documentId}`);
    }, 3000);
  };

  const handlePDFPress = (documentId: string) => {
    const pdf = pdfs.find((p) => p.id === documentId);
    if (pdf?.hasFlashcards) {
      router.push(`/flashcards/${documentId}`);
    }
  };

  const filteredPDFs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        //style={styles.scrollView}
        //contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                searchMode === "pdfs"
                  ? "Search your PDFs..."
                  : "Search Google Scholar..."
              }
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <X size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <View style={styles.searchToggle}>
            <Pressable
              style={[
                styles.toggleButton,
                searchMode === "pdfs" && styles.toggleButtonActive,
              ]}
              onPress={() => setSearchMode("pdfs")}
            >
              <BookOpen
                size={14}
                color={
                  searchMode === "pdfs" ? colors.white : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  searchMode === "pdfs" && styles.toggleTextActive,
                ]}
              >
                My PDFs
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.toggleButton,
                searchMode === "scholar" && styles.toggleButtonActive,
              ]}
              onPress={() => setSearchMode("scholar")}
            >
              <GraduationCap
                size={14}
                color={
                  searchMode === "scholar" ? colors.white : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.toggleText,
                  searchMode === "scholar" && styles.toggleTextActive,
                ]}
              >
                Scholar
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <Pressable 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/(study)/chats");
            }}
          >
            <MessageCircle size={20} color={colors.white} />
            <Text style={styles.chatButtonText}>Messages</Text>
          </Pressable>
        </View>

        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.actionButton}>
            <Upload size={20} color={colors.primary} />
            <Text style={styles.uploadText}>Upload PDF</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Documents</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pdfs.length}</Text>
          </View>
        </View>

        {filteredPDFs.map((pdf) => (
          <PDFCard
            key={pdf.id}
            document={pdf}
            onGenerateFlashcards={() => handleGenerateFlashcards(pdf.id)}
            onPress={() => handlePDFPress(pdf.id)}
          />
        ))}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Study Partners</Text>
            <View style={styles.aiBadge}>
              <Sparkles size={12} color={colors.primary} />
              <Text style={styles.aiBadgeText}>Smart Match</Text>
            </View>
          </View>
        </View>

        {mockStudyPartners.map((partner) => (
          <StudyPartnerCard
            key={partner.id}
            partner={partner}
            onConnect={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/chat/new");
            }}
          />
        ))}
      </ScrollView>

      <AIProgressOverlay
        visible={isGenerating}
        message="AI is analyzing your PDF..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    //backgroundColor: colors.background,
  },
  scrollView: {
    //flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  searchToggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.white,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  chatButton: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
  studentsButton: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  studentsButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.white,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.primary}10`,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.white,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.primary,
  },
});
