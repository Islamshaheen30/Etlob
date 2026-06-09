import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { DriverOrder } from '@/services/driver';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  order: DriverOrder;
  onAccept: () => void;
  onDecline: () => void;
  disabled?: boolean;
}

export function AvailableOrderCard({ order, onAccept, onDecline, disabled }: Props) {
  const itemsTotal = order.items.reduce((s, i) => s + i.qty, 0);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: order.restaurant.image }} style={styles.thumb} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {order.restaurant.name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {order.restaurant.nameAr}
          </Text>
          <View style={styles.metricsRow}>
            <Metric icon="straighten" text={`${order.distanceKm.toFixed(1)} km`} />
            <Metric icon="schedule" text={`${order.estimatedMinutes} min`} />
            <Metric
              icon={order.paymentMethod === 'cash' ? 'attach-money' : 'phone-iphone'}
              text={order.paymentMethod === 'cash' ? 'Cash' : 'Online'}
            />
          </View>
        </View>
        <View style={styles.earningsBadge}>
          <Text style={styles.earningsLabel}>EARN</Text>
          <Text style={styles.earningsValue}>EGP {order.earnings}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.dropRow}>
        <View style={styles.dropIconAlt}>
          <MaterialIcons name="restaurant" size={14} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dropLabel}>PICKUP</Text>
          <Text style={styles.dropValue} numberOfLines={1}>
            {order.restaurant.name}
          </Text>
        </View>
      </View>

      <View style={styles.dropRow}>
        <View style={styles.dropIcon}>
          <MaterialIcons name="location-on" size={14} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dropLabel}>DROP-OFF</Text>
          <Text style={styles.dropValue} numberOfLines={1}>
            {order.customer.name} · {order.customer.area}
          </Text>
        </View>
      </View>

      <View style={styles.itemsBox}>
        <MaterialIcons name="shopping-bag" size={14} color={colors.textMuted} />
        <Text style={styles.itemsText} numberOfLines={1}>
          {itemsTotal} item{itemsTotal > 1 ? 's' : ''} · {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Button
          label="Decline"
          variant="outline"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={onDecline}
          disabled={disabled}
        />
        <View style={{ width: spacing.sm }} />
        <Button
          label="Accept"
          fullWidth={false}
          style={{ flex: 1.4 }}
          onPress={onAccept}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

function Metric({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.metric}>
      <MaterialIcons name={icon} size={12} color={colors.textMuted} />
      <Text style={styles.metricText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  name: { ...typography.bodyStrong, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 6, flexWrap: 'wrap' },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metricText: { ...typography.micro, color: colors.textMuted, fontWeight: '700' },
  earningsBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  earningsLabel: { ...typography.micro, color: colors.textMuted, fontWeight: '800' },
  earningsValue: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  dropRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 8 },
  dropIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropIconAlt: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropLabel: { ...typography.micro, color: colors.textMuted, fontWeight: '800', letterSpacing: 0.5 },
  dropValue: { ...typography.caption, color: colors.text, fontWeight: '600', marginTop: 1 },
  itemsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: 4,
  },
  itemsText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  actionRow: { flexDirection: 'row', marginTop: spacing.md },
});
