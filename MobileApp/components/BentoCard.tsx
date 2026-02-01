import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '@/constants/colors';

interface BentoCardProps {
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large' | 'wide';
  children?: React.ReactNode;
  onPress?: () => void;
  backgroundColor?: string;
  accentColor?: string;
}

export function BentoCard({
  title,
  subtitle,
  size = 'medium',
  children,
  onPress,
  backgroundColor = colors.cardBg,
  accentColor,
}: BentoCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
    wide: styles.wide,
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <Animated.View
        style={[
          styles.card,
          sizeStyles[size],
          { backgroundColor, transform: [{ scale: scaleAnim }] },
          accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor },
        ]}
      >
        {(title || subtitle) && (
          <View style={styles.header}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {title && <Text style={styles.title}>{title}</Text>}
          </View>
        )}
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  small: {
    width: '100%',
    minHeight: 100,
  },
  medium: {
    width: '100%',
    minHeight: 140,
  },
  large: {
    width: '100%',
    minHeight: 180,
  },
  wide: {
    width: '100%',
    minHeight: 100,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
});
