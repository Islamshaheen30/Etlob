import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  AdBanner,
  CategoryBar,
  GeofenceBanner,
  OfferRibbon,
  Pill,
  RestaurantCard,
  Screen,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useOrders } from '@/hooks/useOrders';
import { userIsInDeliveryArea } from '@/services/geofence';
import { APP } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function HomeTab() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const {
    restaurants,
    cuisine,
    setCuisine,
    cuisines,
    query,
    setQuery,
    offerRestaurants,
    loading: restaurantsLoading,
    refresh,
  } = useRestaurants();
  const { orders } = useOrders();
  const [focusedSearch, setFocusedSearch] = useState(false);

  const inArea = useMemo(() => userIsInDeliveryArea(user), [user]);

  const activeOrder = useMemo(
    () =>
      orders.find(
        (o) =>
          o.status !== 'delivered' &&
          o.status !== 'cancelled' &&
          o.status !== 'pending_payment'
      ),
    [orders]
  );

  const featured = useMemo(
    () => restaurants.filter((r) => r.status === 'open').slice(0, 4),
    [restaurants]
  );

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  if (!inArea) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.outerScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.greetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>
                {t('hello')}، {user.name.split(' ')[0]}
              </Text>
              <View style={styles.locRow}>
                <MaterialIcons name="location-on" size={14} color={colors.danger} />
                <Text style={[styles.locText, { color: colors.danger }]}>
                  {t('outsideArea')}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar} hitSlop={8}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <GeofenceBanner onActionPress={() => router.push('/(tabs)/profile')} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxxl,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={restaurantsLoading}
        onRefresh={refresh}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <View style={styles.greetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hello}>
                  {t('hello')}، {user.name.split(' ')[0]}
                </Text>
                <View style={styles.locRow}>
                  <MaterialIcons name="location-on" size={14} color={colors.primaryDark} />
                  <Text style={styles.locText} numberOfLines={1}>
                    {user.address || user.area} · {APP.cityAr}
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar} hitSlop={8}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </Pressable>
            </View>

            <View style={[styles.search, focusedSearch && styles.searchFocused]}>
              <MaterialIcons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('searchHint')}
                placeholderTextColor={colors.textSubtle}
                style={styles.searchInput}
                textAlign="right"
                onFocus={() => setFocusedSearch(true)}
                onBlur={() => setFocusedSearch(false)}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {activeOrder ? (
              <Pressable
                onPress={() => router.push(`/track/${activeOrder.id}`)}
                style={({ pressed }) => [styles.activeBanner, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.activeIcon}>
                  <MaterialIcons name="pedal-bike" size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTitle}>{t('orderInProgress')}</Text>
                  <Text style={styles.activeSub} numberOfLines={1}>
                    {activeOrder.restaurant.name} · {activeOrder.estimatedMinutes} {t('minShort')}
                  </Text>
                </View>
                <MaterialIcons name="chevron-left" size={22} color={colors.text} />
              </Pressable>
            ) : null}

            <AdBanner
              height={180}
              onPressBanner={(b) => {
                if (b.restaurantId) router.push(`/restaurant/${b.restaurantId}`);
              }}
            />

            {restaurantsLoading && restaurants.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.primaryDark} />
                <Text style={styles.loadingText}>جاري تحميل المطاعم...</Text>
              </View>
            ) : null}

            {featured.length > 0 ? (
              <View style={{ marginTop: spacing.sm }}>
                <Text style={styles.section}>{t('featured')}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: spacing.md,
                    paddingHorizontal: 2,
                    paddingVertical: 4,
                  }}
                >
                  {featured.map((r) => (
                    <RestaurantCard
                      key={`f-${r.id}`}
                      restaurant={r}
                      featured
                      onPress={() => router.push(`/restaurant/${r.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {restaurants.length > 0 ? (
              <>
                <Text style={[styles.section, { marginTop: spacing.sm }]}>
                  {t('cuisines')}
                </Text>
                <CategoryBar options={cuisines} value={cuisine} onChange={setCuisine} />
                <Text style={[styles.section, { marginTop: spacing.sm }]}>
                  {t('allRestaurants')}
                </Text>
              </>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !restaurantsLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>لم يتم العثور على مطاعم.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          offerRestaurants.length > 0 ? (
            <View style={styles.offersSection}>
              <View style={styles.offersHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.offersTitleRow}>
                    <View style={styles.offersIcon}>
                      <MaterialIcons name="local-offer" size={16} color={colors.text} />
                    </View>
                    <Text style={styles.section}>{t('specialOffers')}</Text>
                  </View>
                  <Text style={styles.offersSub}>{t('specialOffersSub')}</Text>
                </View>
                <Pill label={`${offerRestaurants.length}`} tone="warning" />
              </View>
              <View style={{ gap: spacing.md }}>
                {offerRestaurants.map((r) => (
                  <OfferRibbon
                    key={`o-${r.id}`}
                    restaurant={r}
                    onPress={() => router.push(`/restaurant/${r.id}`)}
                  />
                ))}
              </View>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  outerScroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hello: { ...typography.title, color: colors.text, textAlign: 'right' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  avatarText: { ...typography.bodyStrong, color: colors.text },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchFocused: { borderColor: colors.primaryDark },
  searchInput: { ...typography.body, color: colors.text, flex: 1, paddingVertical: 10 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  activeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  activeSub: { ...typography.caption, color: colors.text, textAlign: 'right' },
  section: { ...typography.section, color: colors.text, textAlign: 'right' },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
  loadingBox: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: { ...typography.caption, color: colors.textMuted },
  offersSection: { marginTop: spacing.xl, gap: spacing.md },
  offersHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  offersTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  offersIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offersSub: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
});
