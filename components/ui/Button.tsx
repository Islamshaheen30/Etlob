import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  fullWidth = true,
  style,
  iconLeft,
  iconRight,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'dark' && styles.dark,
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && { opacity: 0.55 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      <View style={styles.row}>
        {iconLeft ? <View style={{ marginRight: spacing.sm }}>{iconLeft}</View> : null}
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.text} />
        ) : (
          <Text
            style={[
              styles.text,
              variant === 'outline' && { color: colors.text },
              variant === 'ghost' && { color: colors.text },
              variant === 'dark' && { color: '#fff' },
            ]}
          >
            {label}
          </Text>
        )}
        {iconRight ? <View style={{ marginLeft: spacing.sm }}>{iconRight}</View> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  primary: { backgroundColor: colors.primary, ...shadows.soft },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  dark: { backgroundColor: '#1A1A1A' },
  text: { ...typography.button, color: colors.onPrimary },
});
