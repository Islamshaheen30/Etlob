import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryBar, MenuItemCard, Pill, Screen } from '@/components';
import { useCart } from '@/hooks/useCart';
import { useAlert } from '@/template';
import { getMenuByRestaurant, getRestaurantById } from '@/services/restaurants';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { add, lines, restaurant: cartRestaurant, itemCount, subtotal, setQty, clear } = useCart();

  const restaurant = useMemo(() => getRestaurantById(id || ''), [id]);
  const menu = useMemo(() => getMenuByRestaurant(id || ''), [id]);

  const [category, setCategory] = React.useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(menu.map((m) => m.category)))], [menu]);
  const filtered = useMemo(
    () => (category === 'All' ? menu : menu.filter((m) => m.category === category)),
    [menu, category]
  );

  if (!restaurant) {
    return (
      <Screen>
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted }}>Restaurant not found.</Text>
        </View>
      </Screen>
    );
  }

  const qtyOf = (itemId: string) => lines.find((l) => l.item.id === itemId)?.qty ?? 0;
  const isCartFromOther = cartRestaurant && cartRestaurant.id !== restaurant.id;

  const handleAdd = (mid: string) => {
    const item = menu.find((m) => m.id === mid);
    if (!item) return;
    const result = add(restaurant, item, 1);
    if (!result.ok) {
      showAlert('Different restaurant', result.reason, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear cart',
          style: 'destructive',
          onPress: () => {
            clear();
            add(restaurant, item, 1);
          },
        },
      ]);
    }
  };

  return (
    <Screen edges={[]}>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            {/* Cover */}
            <View style={styles.coverWrap}>
              <Image source={{ uri: restaurant.cover }} style={styles.cover} contentFit="cover" transition={200} />
              <View style={styles.coverOverlay} />
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <MaterialIcons name="chevron-left" size={26} color={colors.text} />
              </Pressable>
              <View style={styles.coverInfo}>
                <Text style={styles.coverTitle}>{restaurant.name}</Text>
                <Text style={styles.coverAr}>{restaurant.nameAr}</Text>
                <View style={styles.coverPills}>
                  <Pill label={restaurant.cuisine} tone="primary" />
                  <Pill
                    label={`${restaurant.rating.toFixed(1)} ★`}
                    tone="warning"
                  />
                  <Pill
                    label={`${restaurant.etaMin} min`}
                    tone="neutral"
                  />
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.desc}>{restaurant.description}</Text>
              <View style={styles.infoRow}>
                <Info icon="pedal-bike" text={`EGP ${restaurant.deliveryFee} delivery`} />
                <Info icon="schedule" text={`${restaurant.etaMin} min ETA`} />
                <Info icon="star" text={`${restaurant.reviews}+ reviews`} />
              </View>

              <Text style={styles.section}>Menu</Text>
            </View>

            <CategoryBar options={categories} value={category} onChange={setCategory} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <MenuItemCard
              item={item}
              qty={qtyOf(item.id)}
              onAdd={() => handleAdd(item.id)}
              onIncrement={() => setQty(item.id, qtyOf(item.id) + 1)}
              onDecrement={() => setQty(item.id, qtyOf(item.id) - 1)}
            />
          </View>
        )}
      />

      {itemCount > 0 && !isCartFromOther ? (
        <Pressable
          onPress={() => router.push('/cart')}
          style={({ pressed }) => [styles.cartBar, pressed && { opacity: 0.95 }]}
        >
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartLabel}>View cart</Text>
          <Text style={styles.cartTotal}>EGP {subtotal.toFixed(0)}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function Info({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.info}>
      <MaterialIcons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coverWrap: { height: 240, backgroundColor: colors.surfaceMuted },
  cover: { width: '100%', height: '100%' },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  backBtn: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  coverTitle: { ...typography.display, color: '#fff' },
  coverAr: { ...typography.body, color: '#FFF7DA' },
  coverPills: { flexDirection: 'row', gap: 6, marginTop: spacing.sm },
  body: { padding: spacing.lg },
  desc: { ...typography.body, color: colors.textMuted },
  infoRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  section: { ...typography.section, color: colors.text, marginTop: spacing.lg },
  cartBar: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: radius.lg,
    gap: spacing.md,
    ...shadows.pop,
  },
  cartCount: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: { ...typography.caption, fontWeight: '800', color: colors.text },
  cartLabel: { ...typography.button, color: '#fff', flex: 1 },
  cartTotal: { ...typography.button, color: colors.primary },
});
