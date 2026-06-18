import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { OUT_OF_AREA, DELIVERY_CIRCLES } from '@/constants/adminSettings';
import { useLocale } from '@/hooks/useLocale';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  onActionPress?: () => void;
}

export function GeofenceBanner({ onActionPress }: Props) {
  const { locale } = useLocale();
  const copy = OUT_OF_AREA[locale];
  const ar = locale === 'ar';

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="location-off" size={26} color={colors.danger} />
      </View>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>

      <View style={styles.zonesBox}>
        <Text style={styles.zonesLabel}>
          {ar ? 'مناطق التغطية' : 'Coverage zones'}
        </Text>
        <View style={styles.zonesList}>
          {DELIVERY_CIRCLES.filter((c) => c.active).map((c) => (
            <View key={c.id} style={styles.zonePill}>
              <View style={styles.zoneDot} />
              <Text style={styles.zoneText}>
                {ar ? c.nameAr : c.name} · {c.radiusKm} km
              </Text>
            </View>
          ))}
        </View>
      </View>

      {onActionPress ? (
        <Pressable onPress={onActionPress} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.92 }]}>
          <MaterialIcons name="edit-location-alt" size={16} color={colors.text} />
          <Text style={styles.ctaText}>{copy.cta}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FBE2E1',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F3B5B3',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  title: { ...typography.section, color: '#8B1F1B', textAlign: 'center', marginTop: spacing.sm },
  body: { ...typography.body, color: '#6B2C2A', textAlign: 'center' },
  zonesBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  zonesLabel: {
    ...typography.micro,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  zonesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  zoneDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryDark },
  zoneText: { ...typography.micro, color: colors.text, fontWeight: '700' },
  cta: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    ...shadows.soft,
  },
  ctaText: { ...typography.button, color: colors.text, fontSize: 14 },
});
