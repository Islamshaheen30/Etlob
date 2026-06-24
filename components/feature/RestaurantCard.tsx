import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { Pill } from '@/components/ui/Pill';
import { Restaurant } from '@/constants/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { distanceKm, getTotalDeliveryMinutes } from '@/services/tracking';
import { getEffectiveLocation } from '@/services/geofence';

interface Props {
  restaurant: Restaurant;
  onPress?: () => void;
  featured?: boolean;
}

export function RestaurantCard({ restaurant, onPress, featured }: Props) {
  const { user } = useAuth();
  const { t } = useLocale();
  const isBusy = restaurant.status !== 'open';

  const time = useMemo(() => {
    const userLoc = getEffectiveLocation(user);
    const dist = distanceKm(userLoc, restaurant.location);
    return getTotalDeliveryMinutes(restaurant.prepTimeMin, dist);
  }, [user, restaurant]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        featured && { width: 280 },
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: restaurant.cover }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {restaurant.offer ? (
          <View style={styles.offerRibbon}>
            <MaterialIcons name="local-offer" size={12} color={colors.text} />
            <Text style={styles.offerText}>
              {restaurant.offer.discountPct}% {t('off')}
            </Text>
          </View>
        ) : null}

        <View style={styles.ratingPill}>
          <MaterialIcons name="star" size={14} color={colors.primary} />
          <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
        </View>

        {isBusy ? (
          <View style={styles.busyOverlay}>
            <View style={styles.busyChip}>
              <MaterialIcons name="schedule" size={14} color="#fff" />
              <Text style={styles.busyText}>{t('busy')}</Text>
            </View>
            <Text style={styles.busyHint}>{t('busyDesc')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>
            {restaurant.nameAr}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.cuisine}>
          {restaurant.cuisine} • {restaurant.reviews}+ طلب
        </Text>
        <View style={styles.metaRow}>
          <Pill
            tone="neutral"
            label={`${time.total} ${t('totalTime')}`}
            icon={<MaterialIcons name="schedule" size={12} color={colors.textMuted} />}
          />
          <Pill
            tone="primary"
            label={`${restaurant.deliveryFee} ج.م`}
            icon={<MaterialIcons name="pedal-bike" size={12} color="#5B4A00" />}
          />
        </View>
        <Text style={styles.timeBreakdown}>
          {time.prep} {t('prepLabel')} + {time.ride} {t('rideLabel')}
          {time.distKm > 0 ? ` · ${time.distKm.toFixed(1)} كم` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 150, backgroundColor: colors.surfaceMuted },
  ratingPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  ratingText: { ...typography.caption, color: colors.text, fontWeight: '700', marginLeft: 2 },
  offerRibbon: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    ...shadows.soft,
  },
  offerText: { ...typography.caption, color: colors.text, fontWeight: '800' },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  busyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    ...shadows.pop,
  },
  busyText: { ...typography.caption, color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  busyHint: {
    ...typography.micro,
    color: colors.text,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  body: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.section, color: colors.text, flex: 1, textAlign: 'right' },
  cuisine: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  timeBreakdown: {
    ...typography.micro,
    color: colors.textMuted,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'right',
  },
});
