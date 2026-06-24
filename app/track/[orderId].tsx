import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, OrderTimeline, Pill, RiderMap, Screen } from '@/components';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { useAlert } from '@/template/ui';
import { distanceKm } from '@/services/tracking';
import { STATUS_LABELS } from '@/services/orders';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function TrackOrder() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { getById } = useOrders();
  const { t } = useLocale();

  const order = useMemo(() => getById(orderId || ''), [getById, orderId]);

  if (!order) {
    return (
      <Screen>
        <Header title={t('trackOrder')} />
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted, textAlign: 'right' }}>
            {t('orderNotFound')}
          </Text>
        </View>
      </Screen>
    );
  }

  const distance = order.riderPosition
    ? distanceKm(order.riderPosition, order.customerPosition).toFixed(2)
    : '--';

  const callRider = () =>
    showAlert(
      t('callRider'),
      `${order.rider?.name ?? 'سائقك'} · ${order.rider?.phone ?? '+20 100 000 0000'}`,
      [
        { text: t('close'), style: 'cancel' },
        { text: t('call'), onPress: () => {} },
      ]
    );

  const statusTone =
    order.status === 'delivered'
      ? 'success'
      : order.status === 'pending_payment' || order.status === 'verifying'
      ? 'warning'
      : 'primary';

  return (
    <Screen>
      <Header
        title={t('trackOrder')}
        subtitle={`#${order.id.slice(-6).toUpperCase()}`}
        right={
          <Pressable onPress={() => router.replace('/(tabs)/orders')} hitSlop={8}>
            <MaterialIcons name="receipt-long" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl }}>
        <Card>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <Pill label={STATUS_LABELS[order.status]} tone={statusTone as any} />
              <Text style={styles.eta}>
                {order.status === 'delivered'
                  ? t('deliveredLabel')
                  : `${order.estimatedMinutes} ${t('minAway')}`}
              </Text>
              <Text style={styles.subtle}>{distance} كم · {order.restaurant.name}</Text>
            </View>
            <View style={styles.riderAvatar}>
              <MaterialIcons name="pedal-bike" size={26} color={colors.text} />
            </View>
          </View>
        </Card>

        {order.riderPosition ? (
          <RiderMap
            rider={order.riderPosition}
            customer={order.customerPosition}
            restaurant={order.restaurantPosition}
            height={300}
          />
        ) : null}

        {order.rider ? (
          <Card>
            <View style={styles.riderRow}>
              <View style={styles.riderAvatarLarge}>
                <Text style={styles.riderInitial}>{order.rider.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.subtle}>{t('bicycleRider')} · ★ {order.rider.rating.toFixed(1)}</Text>
              </View>
              <Pressable onPress={callRider} style={styles.callBtn} hitSlop={6}>
                <MaterialIcons name="phone" size={18} color={colors.text} />
              </Pressable>
            </View>
          </Card>
        ) : null}

        <Card padded={false}>
          <OrderTimeline current={order.status === 'pending_payment' || order.status === 'verifying' ? 'confirmed' : order.status} />
        </Card>

        {order.paymentProof ? (
          <Card>
            <Text style={styles.section}>{t('paymentVerification')}</Text>
            <View style={styles.payRow}>
              <MaterialIcons
                name={order.paymentProof.verified ? 'verified' : 'pending'}
                size={20}
                color={order.paymentProof.verified ? colors.success : colors.warning}
              />
              <Text style={styles.payText}>
                {order.paymentProof.verified
                  ? `تم التحقق من ${order.paymentProof.amount} ج.م من ${order.paymentProof.sender}`
                  : t('awaitingPayment')}
              </Text>
            </View>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.section}>{t('items')}</Text>
          {order.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Image source={{ uri: it.image }} style={styles.itemImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={styles.subtle}>الكمية {it.qty} · {it.price} ج.م</Text>
              </View>
              <Text style={styles.itemTotal}>{(it.price * it.qty).toFixed(0)} ج.م</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label={t('subtotal')} value={`${order.subtotal.toFixed(0)} ج.م`} />
          <Row
            label={t('deliveryFeeLabel')}
            value={order.deliveryFee === 0 ? t('deliveryFree') : `${order.deliveryFee.toFixed(0)} ج.م`}
          />
          <Row label={t('total')} value={`${order.total.toFixed(0)} ج.م`} bold />
        </Card>

        <Button label={t('backToRestaurants')} variant="outline" onPress={() => router.replace('/(tabs)')} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, bold && { ...typography.title, color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  eta: { ...typography.title, color: colors.text, marginTop: spacing.sm, textAlign: 'right' },
  subtle: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  riderAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.soft,
  },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  riderAvatarLarge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  riderInitial: { ...typography.section, color: colors.text },
  riderName: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.soft,
  },
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm, textAlign: 'right' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  payText: { ...typography.body, color: colors.text, flex: 1, textAlign: 'right' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemImg: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  itemName: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  itemTotal: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.bodyStrong, color: colors.text },
});
