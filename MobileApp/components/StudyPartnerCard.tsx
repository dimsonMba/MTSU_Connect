import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { StudyPartner } from '@/types';
import { User, BookOpen, MessageCircle } from 'lucide-react-native';

interface StudyPartnerCardProps {
  partner: StudyPartner;
  onConnect?: () => void;
}

export function StudyPartnerCard({ partner, onConnect }: StudyPartnerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <User size={24} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{partner.name}</Text>
        <Text style={styles.major}>{partner.major}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <BookOpen size={12} color={colors.textSecondary} />
            <Text style={styles.statText}>{partner.sharedClasses} shared classes</Text>
          </View>
        </View>
      </View>
      <View style={styles.matchContainer}>
        <Text style={styles.matchScore}>{partner.matchScore}%</Text>
        <Text style={styles.matchLabel}>Match</Text>
      </View>
      <Pressable style={styles.connectButton} onPress={onConnect}>
        <MessageCircle size={16} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  major: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  matchContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  matchScore: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.success,
  },
  matchLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  connectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
