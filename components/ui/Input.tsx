import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
}

export function Input({ label, error, iconLeft, style, ...rest }: Props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, error ? { borderColor: colors.danger } : null]}>
        {iconLeft ? <View style={{ marginRight: spacing.sm }}>{iconLeft}</View> : null}
        <TextInput
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.caption, color: colors.textMuted, marginBottom: 6, marginLeft: 4 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  error: { ...typography.caption, color: colors.danger, marginTop: 4, marginLeft: 4 },
});
