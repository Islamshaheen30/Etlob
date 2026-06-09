import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function CategoryBar({ options, value, onChange }: Props) {
  return (
    <View style={styles.outer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.text, selected && styles.textSelected]}>{opt}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { minHeight: 52, paddingVertical: spacing.sm },
  content: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary },
  text: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  textSelected: { color: colors.text, fontWeight: '700' },
});
