import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/colors";
import { FlashCard } from "@/components/FlashCard";
import { getFlashcards } from "@/services/rag/getFlashcards";
import { getDocument } from "@/services/storage/documents/getDocument";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function FlashcardsScreen() {
  const { documentId } = useLocalSearchParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<
    Array<{ id: string; question: string; answer: string }>
  >([]);
  const [document, setDocument] = useState<{
    id: string;
    title?: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const doc = await getDocument(documentId as string);
        const fetched = await getFlashcards(documentId as string);
        if (!mounted) return;
        setDocument(doc || null);
        setCards(
          fetched.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
          })),
        );
      } catch (err) {
        console.warn("Failed to load flashcards", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  const handleSwipeRight = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCorrect((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeLeft = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIncorrect((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    setCorrect(0);
    setIncorrect(0);
  };

  const isComplete = currentIndex >= cards.length;
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const visibleCards = cards.slice(currentIndex, currentIndex + 3);
  const stackedCards = [...visibleCards].reverse();

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: document?.title || "Flashcards",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex} / {cards.length}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <CheckCircle size={18} color={colors.success} />
            <Text style={[styles.statText, { color: colors.success }]}>
              {correct}
            </Text>
          </View>
          <View style={styles.statItem}>
            <XCircle size={18} color={colors.error} />
            <Text style={[styles.statText, { color: colors.error }]}>
              {incorrect}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : cards.length === 0 ? (
          <Text style={styles.emptyText}>No flashcards yet</Text>
        ) : isComplete ? (
          <View style={styles.completeContainer}>
            <View style={styles.completeIcon}>
              <CheckCircle size={64} color={colors.success} />
            </View>
            <Text style={styles.completeTitle}>Session Complete!</Text>
            <Text style={styles.completeSubtitle}>
              You got {correct} out of {cards.length} correct
            </Text>

            <View style={styles.scoreCard}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{cards.length > 0 ? Math.round((correct / cards.length) * 100) : 0}%</Text>
                <Text style={styles.scoreLabel}>Accuracy</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{correct}</Text>
                <Text style={styles.scoreLabel}>Correct</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreItem}>
                <Text style={styles.scoreValue}>{incorrect}</Text>
                <Text style={styles.scoreLabel}>To Review</Text>
              </View>
            </View>

            <Pressable style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={20} color={colors.white} />
              <Text style={styles.resetButtonText}>Study Again</Text>
            </Pressable>

            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {stackedCards.map((card, index) => (
              <FlashCard
                key={card.id}
                question={card.question}
                answer={card.answer}
                // Only the top-most card (index 0 after reversing) should react to swipes.
                onSwipeLeft={index === 0 ? handleSwipeLeft : undefined}
                onSwipeRight={index === 0 ? handleSwipeRight : undefined}
                cardIndex={index}
              />
            ))}
          </>
        )}
      </View>

      {cards.length > 0 && !isComplete && (
        <View style={styles.hintContainer}>
          <View style={styles.hintRow}>
            <View
              style={[
                styles.hintBadge,
                { backgroundColor: `${colors.error}15` },
              ]}
            >
              <Text style={[styles.hintText, { color: colors.error }]}>
                ← Swipe left to retry
              </Text>
            </View>
            <View
              style={[
                styles.hintBadge,
                { backgroundColor: `${colors.success}15` },
              ]}
            >
              <Text style={[styles.hintText, { color: colors.success }]}>
                Swipe right if correct →
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    minWidth: 50,
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  completeContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  completeIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  scoreCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: "100%",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scoreDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    gap: 10,
    width: "100%",
    marginBottom: 12,
  },
  resetButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.white,
  },
  doneButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: colors.primary,
    textAlign: "center",
  },
  hintContainer: {
    padding: 20,
    paddingTop: 10,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  hintBadge: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  hintText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
});