import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@/constants/theme';

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}

export function Header({ title, subtitle, showBack = true, right, onBack, transparent }: Props) {
  const router = useRouter();
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };
  return (
    <View style={[styles.row, transparent ? styles.transparent : styles.solid]}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={handleBack} hitSlop={10} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
            <MaterialIcons name="chevron-left" size={26} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.center}>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  solid: { backgroundColor: colors.background },
  transparent: { backgroundColor: 'transparent' },
  side: { width: 80, justifyContent: 'center' },
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  center: { flex: 1, alignItems: 'center' },
  title: { ...typography.section, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
