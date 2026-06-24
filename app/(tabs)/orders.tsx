import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Header, Pill, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { Order, STATUS_LABELS } from '@/services/orders';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function OrdersTab() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { orders } = useOrders();
  const { t } = useLocale();

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  const tone = (s: Order['status']) => {
    if (s === 'delivered') return 'success';
    if (s === 'cancelled') return 'danger';
    if (s === 'pending_payment' || s === 'verifying') return 'warning';
    return 'primary';
  };

  return (
    <Screen>
      <Header
        title={t('myOrders')}
        subtitle={`${orders.length} ${t('itemsCount')}`}
        showBack={false}
      />
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Image
            source={require('@/assets/images/empty-cart.png')}
            style={styles.emptyImage}
            contentFit="contain"
          />
          <Text style={styles.emptyTitle}>{t('noOrders')}</Text>
          <Text style={styles.emptyText}>{t('noOrdersDesc')}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.emptyBtnText}>{t('browseRestaurants')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/track/${item.id}`)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
            >
              <View style={styles.row}>
                <Image source={{ uri: item.restaurant.image }} style={styles.thumb} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={1}>{item.restaurant.name}</Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {item.items.length} {item.items.length > 1 ? t('itemsCount') : t('itemCount')} · {item.total.toFixed(0)} ج.م
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <Pill label={STATUS_LABELS[item.status]} tone={tone(item.status) as any} />
                  </View>
                </View>
                <MaterialIcons name="chevron-left" size={22} color={colors.textMuted} />
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  title: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyImage: { width: 160, height: 160, marginBottom: spacing.md },
  emptyTitle: { ...typography.section, color: colors.text },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.pill,
    ...shadows.soft,
  },
  emptyBtnText: { ...typography.button, color: colors.text },
});
