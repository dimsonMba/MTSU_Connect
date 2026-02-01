import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Dimensions } from 'react-native';
import { colors } from '@/constants/colors';
import { ParkingLot } from '@/types';
import { X, Car, MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ParkingBottomSheetProps {
  lot: ParkingLot | null;
  onClose: () => void;
}

export function ParkingBottomSheet({ lot, onClose }: ParkingBottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (lot) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [lot]);

  if (!lot) return null;

  const getFullnessColor = () => {
    switch (lot.fullness) {
      case 'low': return colors.success;
      case 'medium': return colors.warning;
      case 'high': return colors.error;
    }
  };

  const getFullnessIcon = () => {
    switch (lot.fullness) {
      case 'low': return <TrendingDown size={18} color={colors.success} />;
      case 'medium': return <Minus size={18} color={colors.warning} />;
      case 'high': return <TrendingUp size={18} color={colors.error} />;
    }
  };

  const getFullnessText = () => {
    switch (lot.fullness) {
      case 'low': return 'Low Traffic';
      case 'medium': return 'Moderate Traffic';
      case 'high': return 'High Traffic';
    }
  };

  const permitColor = {
    green: colors.permitGreen,
    red: colors.permitRed,
    blue: colors.permitBlue,
  }[lot.permitType];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.handle} />
      <Pressable style={styles.closeButton} onPress={onClose}>
        <X size={20} color={colors.textSecondary} />
      </Pressable>

      <View style={styles.header}>
        <View style={[styles.permitBadge, { backgroundColor: permitColor }]}>
          <Text style={styles.permitText}>{lot.permitType.toUpperCase()}</Text>
        </View>
        <Text style={styles.lotName}>{lot.name}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Car size={24} color={colors.primary} />
          <Text style={styles.statValue}>{lot.availableSpots}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <MapPin size={24} color={colors.textSecondary} />
          <Text style={styles.statValue}>{lot.spots}</Text>
          <Text style={styles.statLabel}>Total Spots</Text>
        </View>
      </View>

      <View style={[styles.predictionCard, { borderLeftColor: getFullnessColor() }]}>
        <View style={styles.predictionHeader}>
          {getFullnessIcon()}
          <Text style={styles.predictionTitle}>Predicted Fullness</Text>
        </View>
        <Text style={[styles.predictionValue, { color: getFullnessColor() }]}>
          {getFullnessText()}
        </Text>
        <Text style={styles.predictionHint}>
          {lot.fullness === 'high' 
            ? 'Consider alternative lots nearby'
            : lot.fullness === 'medium'
            ? 'Spots filling up - arrive soon'
            : 'Plenty of spots available'}
        </Text>
      </View>

      <Pressable style={styles.directionsButton}>
        <MapPin size={18} color={colors.white} />
        <Text style={styles.directionsText}>Get Directions</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  header: {
    marginBottom: 20,
  },
  permitBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  permitText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.white,
    letterSpacing: 0.5,
  },
  lotName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  predictionCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  predictionValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  predictionHint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  directionsButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
