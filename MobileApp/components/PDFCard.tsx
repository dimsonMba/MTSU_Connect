import React from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import { colors } from "@/constants/colors";
import { PDFDocument } from "@/types";
import {
  FileText,
  Sparkles,
  Check,
  RotateCcw,
  MessageCircle,
} from "lucide-react-native";

interface PDFCardProps {
  document: PDFDocument;
  onGenerateFlashcards?: () => void;
  onRetry?: () => void;
  onPress?: () => void;
  onAsk?: () => void;
}

export function PDFCard({
  document,
  onGenerateFlashcards,
  onRetry,
  onPress,
  onAsk,
}: PDFCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const pageLabel =
    typeof document.pageCount === "number" && document.pageCount > 0
      ? `${document.pageCount} pages`
      : "Counting pages…";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles.iconContainer}>
          <FileText size={28} color={colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title}
          </Text>
          <Text style={styles.meta}>
            {pageLabel} • {formatDate(document.uploadedAt)}
          </Text>
        </View>
        <View style={styles.actionColumn}>
          {document.hasFlashcards ? (
            <View style={styles.completedBadge}>
              <Check size={14} color={colors.success} />
              <Text style={styles.completedText}>Cards Ready</Text>
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.generateButton}
                onPress={onGenerateFlashcards}
              >
                <Sparkles size={14} color={colors.white} />
                <Text style={styles.generateText}>Generate</Text>
              </Pressable>
              {onRetry ? (
                <Pressable style={styles.retryButton} onPress={onRetry}>
                  <RotateCcw size={16} color={colors.primary} />
                </Pressable>
              ) : null}
            </View>
          )}

          {onAsk ? (
            // Quick access into the document-aware chat experience.
            <Pressable style={styles.askButton} onPress={onAsk}>
              <MessageCircle size={16} color={colors.primary} />
              <Text style={styles.askButtonText}>Ask AI</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  generateText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.white,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  retryButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.white}`,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.success,
  },
  askButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  askButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.primary,
  },
});
