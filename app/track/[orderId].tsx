import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, OrderTimeline, Pill, RiderMap, Screen } from '@/components';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { distanceKm } from '@/services/tracking';
import { STATUS_LABELS } from '@/services/orders';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function TrackOrder() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { getById } = useOrders();

  const order = useMemo(() => getById(orderId || ''), [getById, orderId]);

  if (!order) {
    return (
      <Screen>
        <Header title="Track order" />
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted }}>Order not found.</Text>
        </View>
      </Screen>
    );
  }

  const distance = order.riderPosition
    ? distanceKm(order.riderPosition, order.customerPosition).toFixed(2)
    : '--';

  const callRider = () =>
    showAlert('Call rider', `${order.rider?.name ?? 'Your rider'} · ${order.rider?.phone ?? '+20 100 000 0000'}`, [
      { text: 'Close', style: 'cancel' },
      { text: 'Call', onPress: () => {} },
    ]);

  const statusTone =
    order.status === 'delivered'
      ? 'success'
      : order.status === 'pending_payment' || order.status === 'verifying'
      ? 'warning'
      : 'primary';

  return (
    <Screen>
      <Header
        title="Track order"
        subtitle={`#${order.id.slice(-6).toUpperCase()}`}
        right={
          <Pressable onPress={() => router.replace('/(tabs)/orders')} hitSlop={8}>
            <MaterialIcons name="receipt-long" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl }}>
        {/* Status hero */}
        <Card>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <Pill label={STATUS_LABELS[order.status]} tone={statusTone as any} />
              <Text style={styles.eta}>
                {order.status === 'delivered' ? 'Delivered' : `${order.estimatedMinutes} min away`}
              </Text>
              <Text style={styles.subtle}>
                {distance} km · {order.restaurant.name}
              </Text>
            </View>
            <View style={styles.riderAvatar}>
              <MaterialIcons name="pedal-bike" size={26} color={colors.text} />
            </View>
          </View>
        </Card>

        {/* Map */}
        {order.riderPosition ? (
          <RiderMap
            rider={order.riderPosition}
            customer={order.customerPosition}
            restaurant={order.restaurantPosition}
            height={300}
          />
        ) : null}

        {/* Rider card */}
        {order.rider ? (
          <Card>
            <View style={styles.riderRow}>
              <View style={styles.riderAvatarLarge}>
                <Text style={styles.riderInitial}>{order.rider.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.subtle}>
                  Bicycle rider · ★ {order.rider.rating.toFixed(1)}
                </Text>
              </View>
              <Pressable onPress={callRider} style={styles.callBtn} hitSlop={6}>
                <MaterialIcons name="phone" size={18} color={colors.text} />
              </Pressable>
            </View>
          </Card>
        ) : null}

        {/* Timeline */}
        <Card padded={false}>
          <OrderTimeline current={order.status === 'pending_payment' || order.status === 'verifying' ? 'confirmed' : order.status} />
        </Card>

        {/* Payment proof */}
        {order.paymentProof ? (
          <Card>
            <Text style={styles.section}>Payment verification</Text>
            <View style={styles.payRow}>
              <MaterialIcons
                name={order.paymentProof.verified ? 'verified' : 'pending'}
                size={20}
                color={order.paymentProof.verified ? colors.success : colors.warning}
              />
              <Text style={styles.payText}>
                {order.paymentProof.verified
                  ? `AI matched EGP ${order.paymentProof.amount} from ${order.paymentProof.sender}`
                  : 'Awaiting AI verification…'}
              </Text>
            </View>
          </Card>
        ) : null}

        {/* Items */}
        <Card>
          <Text style={styles.section}>Items</Text>
          {order.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <Image source={{ uri: it.image }} style={styles.itemImg} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{it.name}</Text>
                <Text style={styles.subtle}>
                  Qty {it.qty} · EGP {it.price}
                </Text>
              </View>
              <Text style={styles.itemTotal}>EGP {(it.price * it.qty).toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Row label="Subtotal" value={`EGP ${order.subtotal.toFixed(0)}`} />
          <Row
            label="Delivery"
            value={order.deliveryFee === 0 ? 'FREE' : `EGP ${order.deliveryFee.toFixed(0)}`}
          />
          <Row label="Total" value={`EGP ${order.total.toFixed(0)}`} bold />
        </Card>

        <Button
          label="Back to restaurants"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
        />
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
  eta: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  subtle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  riderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  riderAvatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderInitial: { ...typography.section, color: colors.text },
  riderName: { ...typography.bodyStrong, color: colors.text },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  payText: { ...typography.body, color: colors.text, flex: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemImg: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  itemName: { ...typography.bodyStrong, color: colors.text },
  itemTotal: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.bodyStrong, color: colors.text },
});
