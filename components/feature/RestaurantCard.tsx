import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { Pill } from '@/components/ui/Pill';
import { Restaurant } from '@/constants/mockData';

interface Props {
  restaurant: Restaurant;
  onPress?: () => void;
  featured?: boolean;
}

export function RestaurantCard({ restaurant, onPress, featured }: Props) {
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
        <View style={styles.ratingPill}>
          <MaterialIcons name="star" size={14} color={colors.primary} />
          <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>
            {restaurant.name}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.cuisine}>
          {restaurant.cuisine} • {restaurant.reviews}+ orders
        </Text>
        <View style={styles.metaRow}>
          <Pill
            tone="neutral"
            label={`${restaurant.etaMin} min`}
            icon={<MaterialIcons name="schedule" size={12} color={colors.textMuted} />}
          />
          <Pill
            tone="primary"
            label={`EGP ${restaurant.deliveryFee}`}
            icon={<MaterialIcons name="pedal-bike" size={12} color="#5B4A00" />}
          />
        </View>
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
  body: { padding: spacing.lg },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.section, color: colors.text, flex: 1 },
  cuisine: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
