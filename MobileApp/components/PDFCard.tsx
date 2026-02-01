import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '@/constants/colors';
import { PDFDocument } from '@/types';
import { FileText, Sparkles, Check } from 'lucide-react-native';

interface PDFCardProps {
  document: PDFDocument;
  onGenerateFlashcards?: () => void;
  onPress?: () => void;
}

export function PDFCard({ document, onGenerateFlashcards, onPress }: PDFCardProps) {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <FileText size={28} color={colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{document.title}</Text>
          <Text style={styles.meta}>
            {document.pageCount} pages • {formatDate(document.uploadedAt)}
          </Text>
        </View>
        {document.hasFlashcards ? (
          <View style={styles.completedBadge}>
            <Check size={14} color={colors.success} />
            <Text style={styles.completedText}>Cards Ready</Text>
          </View>
        ) : (
          <Pressable style={styles.generateButton} onPress={onGenerateFlashcards}>
            <Sparkles size={14} color={colors.white} />
            <Text style={styles.generateText}>Generate</Text>
          </Pressable>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  generateText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.white,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.success,
  },
});
