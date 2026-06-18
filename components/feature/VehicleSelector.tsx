import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VehicleType } from '@/constants/adminSettings';
import { getAllVehicleQuotes } from '@/services/vehicles';
import { useLocale } from '@/hooks/useLocale';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  distKm: number;
  value: VehicleType;
  onChange: (v: VehicleType) => void;
}

const TAG_KEY: Record<VehicleType, 'ecoTag' | 'fastestTag' | 'balancedTag'> = {
  bicycle: 'ecoTag',
  motorcycle: 'fastestTag',
  scooter: 'balancedTag',
};

const NAME_KEY: Record<
  VehicleType,
  'vehicleBicycle' | 'vehicleMotorcycle' | 'vehicleScooter'
> = {
  bicycle: 'vehicleBicycle',
  motorcycle: 'vehicleMotorcycle',
  scooter: 'vehicleScooter',
};

export function VehicleSelector({ distKm, value, onChange }: Props) {
  const { t } = useLocale();
  const quotes = getAllVehicleQuotes(distKm);

  return (
    <View style={styles.row}>
      {quotes.map((q) => {
        const active = q.rate.id === value;
        return (
          <Pressable
            key={q.rate.id}
            onPress={() => onChange(q.rate.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.card,
              active && styles.cardActive,
              pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={[styles.iconWrap, active && styles.iconActive]}>
              <MaterialIcons
                name={q.rate.icon as any}
                size={26}
                color={active ? colors.text : colors.textMuted}
              />
            </View>
            <Text style={styles.tag}>{t(TAG_KEY[q.rate.id])}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {t(NAME_KEY[q.rate.id])}
            </Text>
            <Text style={styles.fee}>EGP {q.fee}</Text>
            <View style={styles.metaRow}>
              <MaterialIcons name="schedule" size={11} color={colors.textMuted} />
              <Text style={styles.meta}>
                {q.rideMinutes} {t('minShort')}
              </Text>
            </View>
            <View style={styles.modePill}>
              <Text style={styles.modeText}>
                {q.rate.mode === 'flat'
                  ? t('flatRate')
                  : `EGP ${q.rate.perKmFee}${t('perKmShort')}`}
              </Text>
            </View>
            {active ? (
              <View style={styles.checkBadge}>
                <MaterialIcons name="check" size={14} color={colors.text} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
    position: 'relative',
  },
  cardActive: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    ...shadows.soft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconActive: {
    backgroundColor: colors.primary,
  },
  tag: {
    ...typography.micro,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.bodyStrong,
    color: colors.text,
    fontSize: 14,
  },
  fee: {
    ...typography.title,
    color: colors.text,
    fontSize: 20,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  meta: {
    ...typography.micro,
    color: colors.textMuted,
    fontWeight: '700',
  },
  modePill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
});
