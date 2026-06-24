import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  AddOnsSheet,
  CategoryBar,
  MenuItemCard,
  Pill,
  Screen,
} from '@/components';
import { useCart } from '@/hooks/useCart';
import { useLocale } from '@/hooks/useLocale';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import {
  getMenuByRestaurant,
  getRestaurantById,
  suggestAddOns,
} from '@/services/restaurants';
import { distanceKm, getTotalDeliveryMinutes } from '@/services/tracking';
import { getEffectiveLocation } from '@/services/geofence';
import { SINGLE_RESTAURANT_WARNING } from '@/constants/adminSettings';
import { MenuItem } from '@/constants/mockData';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { t } = useLocale();
  const {
    lines,
    restaurant: cartRestaurant,
    itemCount,
    subtotal,
    setQty,
    clear,
    add,
  } = useCart();

  const restaurant = useMemo(() => getRestaurantById(id || ''), [id]);
  const menu = useMemo(() => getMenuByRestaurant(id || ''), [id]);

  const [category, setCategory] = useState<string>('All');
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);
  const [addOnsVisible, setAddOnsVisible] = useState(false);

  const time = useMemo(() => {
    if (!restaurant) return null;
    const userLoc = getEffectiveLocation(user);
    const dist = distanceKm(userLoc, restaurant.location);
    return getTotalDeliveryMinutes(restaurant.prepTimeMin, dist);
  }, [user, restaurant]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );
  const filtered = useMemo(
    () => (category === 'All' ? menu : menu.filter((m) => m.category === category)),
    [menu, category]
  );

  const cartItemIds = useMemo(() => lines.map((l) => l.item.id), [lines]);
  const sheetSuggestions = useMemo(() => {
    if (!pendingItem || !restaurant) return [];
    return suggestAddOns(restaurant.id, [...cartItemIds, pendingItem.id], 4);
  }, [pendingItem, restaurant, cartItemIds]);

  if (!restaurant) {
    return (
      <Screen>
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted, textAlign: 'right' }}>
            المطعم غير موجود.
          </Text>
        </View>
      </Screen>
    );
  }

  const isBusy = restaurant.status !== 'open';
  const qtyOf = (itemId: string) => lines.find((l) => l.item.id === itemId)?.qty ?? 0;
  const isCartFromOther = !!cartRestaurant && cartRestaurant.id !== restaurant.id;

  const openSheetFor = (item: MenuItem) => {
    setPendingItem(item);
    setAddOnsVisible(true);
  };

  const handleAdd = (mid: string) => {
    if (isBusy) return;
    const item = menu.find((m) => m.id === mid);
    if (!item) return;

    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      const w = SINGLE_RESTAURANT_WARNING;
      showAlert(w.title, w.body, [
        { text: w.cancel, style: 'cancel' },
        {
          text: w.confirm,
          style: 'destructive',
          onPress: () => {
            clear();
            openSheetFor(item);
          },
        },
      ]);
      return;
    }

    openSheetFor(item);
  };

  const handleConfirmAddOns = (addOnIds: string[]) => {
    if (!pendingItem) {
      setAddOnsVisible(false);
      return;
    }
    add(restaurant, pendingItem, 1);
    addOnIds.forEach((aid) => {
      const addOn = menu.find((m) => m.id === aid);
      if (addOn) add(restaurant, addOn, 1);
    });
    setAddOnsVisible(false);
    setPendingItem(null);
  };

  const handleCloseAddOns = () => {
    setAddOnsVisible(false);
    setPendingItem(null);
  };

  const offer = restaurant.offer;

  return (
    <Screen edges={[]}>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListHeaderComponent={
          <View>
            {/* Cover */}
            <View style={styles.coverWrap}>
              <Image
                source={{ uri: restaurant.cover }}
                style={styles.cover}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.coverOverlay} />
              <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                <MaterialIcons name="chevron-right" size={26} color={colors.text} />
              </Pressable>
              {isBusy ? (
                <View style={styles.coverBusy}>
                  <MaterialIcons name="schedule" size={14} color="#fff" />
                  <Text style={styles.coverBusyText}>{t('busy')}</Text>
                </View>
              ) : null}
              <View style={styles.coverInfo}>
                <Text style={styles.coverTitle}>{restaurant.nameAr}</Text>
                <Text style={styles.coverAr}>{restaurant.name}</Text>
                <View style={styles.coverPills}>
                  <Pill label={restaurant.cuisine} tone="primary" />
                  <Pill label={`${restaurant.rating.toFixed(1)} ★`} tone="warning" />
                  {time ? (
                    <Pill label={`${time.total} ${t('totalTime')}`} tone="neutral" />
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={styles.desc}>{restaurant.description}</Text>

              <View style={styles.infoRow}>
                <Info icon="pedal-bike" text={`${restaurant.deliveryFee} ج.م`} />
                {time ? <Info icon="restaurant" text={`${time.prep} ${t('prepLabel')}`} /> : null}
                {time ? <Info icon="directions-bike" text={`${time.ride} ${t('rideLabel')}`} /> : null}
                <Info icon="star" text={`${restaurant.reviews}+`} />
              </View>

              {time ? (
                <View style={styles.totalTimeBox}>
                  <View style={styles.totalTimeIcon}>
                    <MaterialIcons name="schedule" size={18} color={colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.totalTimeLabel}>إجمالي وقت التوصيل</Text>
                    <Text style={styles.totalTimeValue}>{time.total} دقيقة</Text>
                  </View>
                  <Text style={styles.totalTimeSub}>
                    {time.prep} {t('prepLabel')} + {time.ride} {t('rideLabel')}
                    {time.distKm > 0 ? `\n${time.distKm.toFixed(1)} كم` : ''}
                  </Text>
                </View>
              ) : null}

              {isBusy ? (
                <View style={styles.busyBanner}>
                  <View style={styles.busyBannerIcon}>
                    <MaterialIcons name="pause-circle" size={22} color={colors.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.busyTitle}>{t('busyBannerTitle')}</Text>
                    <Text style={styles.busyBody}>{t('busyBannerBody')}</Text>
                  </View>
                </View>
              ) : null}

              {offer ? (
                <View style={styles.offerCard}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeNum}>{offer.discountPct}%</Text>
                    <Text style={styles.offerBadgeLabel}>{t('off')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.offerLabel}>{t('yourOffer')}</Text>
                    <Text style={styles.offerTitle}>{offer.titleAr}</Text>
                    <Text style={styles.offerDesc}>{offer.descAr}</Text>
                    {offer.code ? (
                      <View style={styles.offerCodePill}>
                        <MaterialIcons name="confirmation-number" size={12} color={colors.text} />
                        <Text style={styles.offerCode}>{offer.code}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <Text style={styles.section}>{t('menu')}</Text>
            </View>

            <CategoryBar options={categories} value={category} onChange={setCategory} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.lg }}>
            <MenuItemCard
              item={item}
              qty={qtyOf(item.id)}
              disabled={isBusy}
              onAdd={() => handleAdd(item.id)}
              onIncrement={() => setQty(item.id, qtyOf(item.id) + 1)}
              onDecrement={() => setQty(item.id, qtyOf(item.id) - 1)}
            />
          </View>
        )}
      />

      {itemCount > 0 && !isCartFromOther && !isBusy ? (
        <Pressable
          onPress={() => router.push('/cart')}
          style={({ pressed }) => [styles.cartBar, pressed && { opacity: 0.95 }]}
        >
          <View style={styles.cartCount}>
            <Text style={styles.cartCountText}>{itemCount}</Text>
          </View>
          <Text style={styles.cartLabel}>{t('viewCart')}</Text>
          <Text style={styles.cartTotal}>{subtotal.toFixed(0)} ج.م</Text>
        </Pressable>
      ) : null}

      <AddOnsSheet
        visible={addOnsVisible}
        mainItem={pendingItem}
        suggestions={sheetSuggestions}
        onClose={handleCloseAddOns}
        onConfirm={handleConfirmAddOns}
      />
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
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  backBtn: {
    position: 'absolute', top: 44, right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
  coverBusy: {
    position: 'absolute', top: 44, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.pill, ...shadows.pop,
  },
  coverBusyText: { ...typography.caption, color: '#fff', fontWeight: '800' },
  coverInfo: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  coverTitle: { ...typography.display, color: '#fff', textAlign: 'right' },
  coverAr: { ...typography.body, color: '#FFF7DA', textAlign: 'right' },
  coverPills: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  body: { padding: spacing.lg, gap: spacing.md },
  desc: { ...typography.body, color: colors.textMuted, textAlign: 'right' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  info: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1, borderColor: colors.border,
  },
  infoText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  totalTimeBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.primary,
  },
  totalTimeIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  totalTimeLabel: { ...typography.micro, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.5, textAlign: 'right' },
  totalTimeValue: { ...typography.title, color: colors.text, marginTop: 2, textAlign: 'right' },
  totalTimeSub: { ...typography.micro, color: colors.textMuted, fontWeight: '700', textAlign: 'left' },
  busyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FBE2E1',
    padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, borderColor: '#F3B5B3',
  },
  busyBannerIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  busyTitle: { ...typography.bodyStrong, color: '#8B1F1B', textAlign: 'right' },
  busyBody: { ...typography.caption, color: '#6B2C2A', marginTop: 2, textAlign: 'right' },
  offerCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#1A1A1A',
    padding: spacing.md, borderRadius: radius.lg, ...shadows.pop,
  },
  offerBadge: {
    width: 64, height: 64, borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  offerBadgeNum: { ...typography.title, color: colors.text, lineHeight: 24 },
  offerBadgeLabel: { fontSize: 10, fontWeight: '800', color: '#5B4A00', letterSpacing: 0.5 },
  offerLabel: { ...typography.micro, color: colors.primary, fontWeight: '800', letterSpacing: 0.5, textAlign: 'right' },
  offerTitle: { ...typography.bodyStrong, color: '#fff', marginTop: 2, textAlign: 'right' },
  offerDesc: { ...typography.caption, color: '#B8B8B8', marginTop: 2, textAlign: 'right' },
  offerCodePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.pill, marginTop: 6,
  },
  offerCode: { ...typography.micro, color: colors.text, fontWeight: '800', letterSpacing: 1 },
  section: { ...typography.section, color: colors.text, textAlign: 'right' },
  cartBar: {
    position: 'absolute', bottom: spacing.lg, left: spacing.lg, right: spacing.lg,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderRadius: radius.lg, gap: spacing.md, ...shadows.pop,
  },
  cartCount: {
    backgroundColor: colors.primary,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cartCountText: { ...typography.caption, fontWeight: '800', color: colors.text },
  cartLabel: { ...typography.button, color: '#fff', flex: 1, textAlign: 'right' },
  cartTotal: { ...typography.button, color: colors.primary },
});
