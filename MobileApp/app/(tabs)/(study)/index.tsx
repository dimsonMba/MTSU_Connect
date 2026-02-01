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
import { mockStudyPartners } from "@/mocks/data";
import { getMyDocuments } from "@/services/storage/documents/getMyDocuments";
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
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { createDocument } from "@/services/storage/documents/createDocument";
import { uploadPdfToStorage } from "@/services/storage/uploadPdf";
import { updateDocumentStorage } from "@/services/storage/documents/createDocument";
import { generateFlashcards } from "@/services/rag/flashcards";
import { ingestPdf } from "@/services/rag/ingestPdf";
import { supabase } from "@/lib/supabase";

type SearchMode = "pdfs" | "scholar";

export default function StudyScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("pdfs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState<string | undefined>(
    undefined,
  );
  const [pdfs, setPdfs] = useState<Array<any>>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const refreshDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await getMyDocuments();
      setPdfs(docs);
    } catch (err) {
      console.warn("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  React.useEffect(() => {
    refreshDocuments();
  }, []);

  const handleGenerateFlashcards = async (documentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);
    try {
      setGeneratingStage("Ingesting PDF (if needed)...");
      try {
        await ingestPdf(documentId);
      } catch (ingestErr) {
        console.warn("ingestPdf failed during manual generate", ingestErr);
      }

      setGeneratingStage("Generating flashcards...");
      await generateFlashcards(documentId);
      setPdfs((prev) =>
        prev.map((pdf) =>
          pdf.id === documentId ? { ...pdf, hasFlashcards: true } : pdf,
        ),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Show a small confirmation and let the user open the flashcards
      Alert.alert(
        "Flashcards ready",
        "Flashcards were generated successfully.",
        [
          {
            text: "Open",
            onPress: () => router.push(`/flashcards/${documentId}`),
          },
          { text: "Close", style: "cancel" },
        ],
      );
    } catch (err) {
      console.warn("Failed to generate flashcards", err);
      Alert.alert("Generation failed", (err as any)?.message || String(err));
    } finally {
      setIsGenerating(false);
      setGeneratingStage(undefined);
    }
  };

  const handleUploadPdf = async () => {
    try {
      console.log("handleUploadPdf: start");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Ensure user is authenticated before trying to create/update rows
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user || !user.id) {
        Alert.alert(
          "Not signed in",
          "You must be signed in to upload documents.",
        );
        return;
      }
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      console.log("DocumentPicker result:", res);

      // Handle different runtime shapes. Prefer the documented `type === 'success'` check,
      // but also support returned objects that include a `uri` field or an `assets` array.
      let pickedUri: string | undefined;
      if (res && typeof res === "object") {
        // Newer Expo DocumentPicker shape (and some platforms): { assets: [{ uri, name, ... }], canceled: boolean }
        // @ts-ignore
        if (
          Array.isArray(res.assets) &&
          res.assets.length > 0 &&
          res.assets[0]?.uri
        ) {
          // @ts-ignore
          pickedUri = res.assets[0].uri;
        } else if ("type" in res) {
          // Common shape: { type: 'success', uri, name }
          // @ts-ignore
          if (res.type !== "success") {
            Alert.alert("No file selected", "Please pick a PDF to upload.");
            return;
          }
          // @ts-ignore
          pickedUri = res.uri || res.fileUri || res.uri;
        } else {
          // Fallback: if object has uri, use it
          // @ts-ignore
          pickedUri = res.uri || res.fileUri;
        }
      }

      if (!pickedUri) {
        Alert.alert(
          "No file selected",
          "Please pick a PDF to upload. (picker returned unexpected result)",
        );
        console.warn("DocumentPicker returned unexpected shape:", res);
        return;
      }

      // create DB row
      setIsGenerating(true);
      setGeneratingStage("Creating document record...");
      const title =
        "name" in res && res.name
          ? String(res.name).replace(/\.pdf$/i, "")
          : "Untitled";
      const { id: documentId, user_id } = await createDocument(title);

      // upload file to storage
      const uri = pickedUri as string;
      console.log("Uploading file URI:", uri);
      setGeneratingStage("Uploading PDF to storage...");
      const uploadRes = await uploadPdfToStorage({
        fileUri: uri,
        documentId,
        userId: user_id,
      });
      await updateDocumentStorage(documentId, uploadRes.bucket, uploadRes.path);

      // Ingest PDF (extract text, chunk, embed) via edge function
      try {
        setGeneratingStage("Ingesting PDF (extracting & embedding)...");
        await ingestPdf(documentId);
      } catch (ingestErr) {
        // Log but allow fallback to try generating flashcards anyway
        console.warn("ingestPdf failed", ingestErr);
      }

      // Optionally start generation automatically
      setGeneratingStage("Generating flashcards...");
      await generateFlashcards(documentId);

      // refresh list from server so UI stays authoritative
      await refreshDocuments();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Upload complete",
        uploadRes.signedUrl
          ? "Signed URL created (valid 1h)"
          : "Uploaded to storage",
      );
      console.log("Uploaded file signed URL:", uploadRes.signedUrl);
      router.push(`/flashcards/${documentId}`);
    } catch (err: any) {
      console.warn("Upload PDF failed", err);
      Alert.alert("Upload failed", err?.message || String(err));
    } finally {
      setIsGenerating(false);
      setGeneratingStage(undefined);
    }
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
              // Push to the sibling route inside the same stack group. Use a
              // relative route name ("chats") instead of an absolute path
              // ("/chats") which would look for a top-level /chats route.
              router.push("chats" as any);
            }}
          >
            <MessageCircle size={20} color={colors.white} />
            <Text style={styles.chatButtonText}>Messages</Text>
          </Pressable>
        </View>

        <View style={styles.actionButtonsRow}>
          <Pressable style={styles.actionButton} onPress={handleUploadPdf}>
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
            onRetry={() => handleGenerateFlashcards(pdf.id)}
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
        message={generatingStage ?? "AI is analyzing your PDF..."}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
