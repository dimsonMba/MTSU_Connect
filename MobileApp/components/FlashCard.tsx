import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface FlashCardProps {
  question: string;
  answer: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  cardIndex: number;
}

export function FlashCard({ question, answer, onSwipeLeft, onSwipeRight, cardIndex }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onSwipeRight?.();
      position.setValue({ x: 0, y: 0 });
      setIsFlipped(false);
    });
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onSwipeLeft?.();
      position.setValue({ x: 0, y: 0 });
      setIsFlipped(false);
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  };

  const flipCard = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const leftOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const rightOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
          zIndex: 100 - cardIndex,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.badge, styles.wrongBadge, { opacity: leftOpacity }]}>
        <Text style={styles.badgeText}>RETRY</Text>
      </Animated.View>
      <Animated.View style={[styles.badge, styles.correctBadge, { opacity: rightOpacity }]}>
        <Text style={styles.badgeText}>GOT IT!</Text>
      </Animated.View>

      <Pressable onPress={flipCard} style={styles.cardTouchable}>
        <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
          <Text style={styles.cardLabel}>Question</Text>
          <Text style={styles.questionText}>{question}</Text>
          <View style={styles.flipHint}>
            <RotateCcw size={16} color={colors.textMuted} />
            <Text style={styles.flipHintText}>Tap to flip</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
          <Text style={styles.cardLabel}>Answer</Text>
          <Text style={styles.answerText}>{answer}</Text>
          <View style={styles.flipHint}>
            <RotateCcw size={16} color={colors.white} />
            <Text style={[styles.flipHintText, { color: colors.white }]}>Tap to flip</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: 380,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: colors.white,
  },
  cardBack: {
    backgroundColor: colors.primary,
  },
  cardLabel: {
    position: 'absolute',
    top: 20,
    left: 24,
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '500' as const,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 30,
  },
  flipHint: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flipHintText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  badge: {
    position: 'absolute',
    top: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    zIndex: 10,
  },
  wrongBadge: {
    right: 20,
    borderColor: colors.error,
    transform: [{ rotate: '15deg' }],
  },
  correctBadge: {
    left: 20,
    borderColor: colors.success,
    transform: [{ rotate: '-15deg' }],
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.text,
  },
});
