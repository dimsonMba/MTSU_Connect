import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '@/constants/colors';

type PermitType = 'green' | 'red' | 'blue' | null;

interface PermitSelectorProps {
  selected: PermitType;
  onSelect: (permit: PermitType) => void;
}

const permits: { type: PermitType; label: string; color: string }[] = [
  { type: 'green', label: 'Green', color: colors.permitGreen },
  { type: 'red', label: 'Red', color: colors.permitRed },
  { type: 'blue', label: 'Blue', color: colors.permitBlue },
];

export function PermitSelector({ selected, onSelect }: PermitSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filter by Permit</Text>
      <View style={styles.buttons}>
        {permits.map((permit) => {
          const isSelected = selected === permit.type;
          return (
            <Pressable
              key={permit.type}
              style={[
                styles.button,
                { borderColor: permit.color },
                isSelected && { backgroundColor: permit.color },
              ]}
              onPress={() => onSelect(isSelected ? null : permit.type)}
            >
              <View style={[styles.dot, { backgroundColor: permit.color }]} />
              <Text
                style={[
                  styles.buttonText,
                  isSelected && { color: colors.white },
                ]}
              >
                {permit.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default PermitSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
});
