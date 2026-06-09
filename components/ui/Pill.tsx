import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const toneStyles = {
  primary: { bg: colors.primarySoft, fg: '#5B4A00' },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: '#FFE9C7', fg: '#A06400' },
  danger: { bg: '#FBE2E1', fg: colors.danger },
  neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
};

export function Pill({ label, tone = 'primary', icon, style }: Props) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }, style]}>
      {icon ? <View style={{ marginRight: 4 }}>{icon}</View> : null}
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: { ...typography.caption, fontWeight: '700' },
});
