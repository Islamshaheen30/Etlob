import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Restaurant } from '@/constants/mockData';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  restaurant: Restaurant;
  onPress?: () => void;
}

export function OfferRibbon({ restaurant, onPress }: Props) {
  const { t } = useLocale();
  const offer = restaurant.offer;
  if (!offer) return null;
  const title = offer.titleAr;
  const desc = offer.descAr;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.94, transform: [{ scale: 0.99 }] }]}
    >
      <View style={styles.thumbWrap}>
        <Image source={{ uri: restaurant.cover }} style={styles.thumb} contentFit="cover" transition={200} />
        <View style={styles.thumbOverlay} />
        <View style={styles.badge}>
          <Text style={styles.badgeNum}>{offer.discountPct}%</Text>
          <Text style={styles.badgeLabel}>{t('off')}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.restName} numberOfLines={1}>{restaurant.nameAr}</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{desc}</Text>
        <View style={styles.footer}>
          <View style={styles.ctaPill}>
            <MaterialIcons name="local-offer" size={12} color={colors.text} />
            <Text style={styles.ctaText}>{t('viewOffer')}</Text>
          </View>
          {offer.code ? (
            <View style={styles.codePill}>
              <Text style={styles.codeText}>{offer.code}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbWrap: { width: 130, position: 'relative', backgroundColor: colors.surfaceMuted },
  thumb: { width: '100%', height: '100%', minHeight: 130 },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignItems: 'center',
    ...shadows.soft,
  },
  badgeNum: { ...typography.bodyStrong, color: colors.text, lineHeight: 18 },
  badgeLabel: { fontSize: 9, fontWeight: '800', color: '#5B4A00', letterSpacing: 0.5 },
  body: { flex: 1, padding: spacing.md, gap: 4 },
  restName: { ...typography.caption, color: colors.textMuted, fontWeight: '700', textAlign: 'right' },
  title: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  desc: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  ctaText: { ...typography.micro, color: colors.text, fontWeight: '800' },
  codePill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  codeText: { ...typography.micro, color: colors.text, fontWeight: '800', letterSpacing: 1 },
});
