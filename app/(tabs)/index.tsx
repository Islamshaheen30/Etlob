import React, { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CategoryBar, Pill, RestaurantCard, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useOrders } from '@/hooks/useOrders';
import { APP } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function HomeTab() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { restaurants, cuisine, setCuisine, cuisines, query, setQuery } = useRestaurants();
  const { orders } = useOrders();

  const activeOrder = useMemo(
    () =>
      orders.find(
        (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'pending_payment'
      ),
    [orders]
  );

  const featured = useMemo(() => restaurants.slice(0, 4), [restaurants]);

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  return (
    <Screen>
      <FlatList
        data={restaurants}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            {/* Greeting */}
            <View style={styles.greetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hello}>Hello, {user.name.split(' ')[0]}</Text>
                <View style={styles.locRow}>
                  <MaterialIcons name="location-on" size={14} color={colors.primaryDark} />
                  <Text style={styles.locText}>
                    {user.area} · {APP.city}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.avatar}
                hitSlop={8}
              >
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.search}>
              <MaterialIcons name="search" size={18} color={colors.textMuted} />
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {}}
              >
                <Text
                  style={[styles.searchInput, !query && { color: colors.textSubtle }]}
                  onPress={() => {}}
                >
                  {query || 'Search restaurants or cuisines'}
                </Text>
              </Pressable>
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <MaterialIcons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Active order banner */}
            {activeOrder ? (
              <Pressable
                onPress={() => router.push(`/track/${activeOrder.id}`)}
                style={({ pressed }) => [styles.activeBanner, pressed && { opacity: 0.92 }]}
              >
                <View style={styles.activeIcon}>
                  <MaterialIcons name="pedal-bike" size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeTitle}>Order in progress</Text>
                  <Text style={styles.activeSub}>
                    {activeOrder.restaurant.name} · ETA {activeOrder.estimatedMinutes} min
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={colors.text} />
              </Pressable>
            ) : null}

            {/* Hero strip */}
            <View style={styles.hero}>
              <View style={{ flex: 1, padding: spacing.lg }}>
                <Pill label={`${APP.city} only`} tone="neutral" />
                <Text style={styles.heroTitle}>Free delivery on{'\n'}every 10 referrals</Text>
                <Text style={styles.heroSub}>
                  Free deliveries: {user.freeDeliveries} · Friends invited: {user.referredCount}
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/profile')}
                  style={styles.heroBtn}
                >
                  <Text style={styles.heroBtnText}>Get my code</Text>
                  <MaterialIcons name="chevron-right" size={16} color={colors.text} />
                </Pressable>
              </View>
              <View style={styles.heroIllust}>
                <MaterialIcons name="redeem" size={64} color={colors.primaryDark} />
              </View>
            </View>

            {/* Featured rail */}
            <View style={{ marginTop: spacing.sm }}>
              <Text style={styles.section}>Featured in {APP.city}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md, paddingHorizontal: 2, paddingVertical: 4 }}
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

            {/* Categories */}
            <Text style={[styles.section, { marginTop: spacing.sm }]}>Browse by cuisine</Text>
            <CategoryBar options={cuisines} value={cuisine} onChange={setCuisine} />
            <Text style={[styles.section, { marginTop: spacing.sm }]}>All restaurants</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => router.push(`/restaurant/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No restaurants found.</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hello: { ...typography.title, color: colors.text },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locText: { ...typography.caption, color: colors.textMuted },
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
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { ...typography.body, color: colors.text },
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
  activeTitle: { ...typography.bodyStrong, color: colors.text },
  activeSub: { ...typography.caption, color: colors.text },
  hero: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.soft,
  },
  heroTitle: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  heroSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  heroBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    gap: 4,
  },
  heroBtnText: { ...typography.caption, color: colors.text, fontWeight: '700' },
  heroIllust: { width: 110, alignItems: 'center', justifyContent: 'center' },
  section: { ...typography.section, color: colors.text },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.textMuted },
});
