import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal } from 'react-native';
import { colors } from '@/constants/colors';
import { Sparkles } from 'lucide-react-native';

interface AIProgressOverlayProps {
  visible: boolean;
  message?: string;
}

export function AIProgressOverlay({ visible, message = 'AI is analyzing your PDF...' }: AIProgressOverlayProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      progressAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Sparkles size={32} color={colors.primary} />
          </Animated.View>
          <Text style={styles.title}>{message}</Text>
          <Text style={styles.subtitle}>This may take a moment</Text>
          <View style={styles.progressContainer}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <View style={styles.stepsContainer}>
            <Text style={styles.step}>• Extracting text content</Text>
            <Text style={styles.step}>• Identifying key concepts</Text>
            <Text style={styles.step}>• Generating flashcards</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepsContainer: {
    alignSelf: 'flex-start',
  },
  step: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
});
