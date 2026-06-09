import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { OrderStatus, STATUS_LABELS } from '@/services/orders';

interface Props {
  current: OrderStatus;
}

const STAGES: { key: OrderStatus; icon: any; sub: string }[] = [
  { key: 'confirmed', icon: 'check-circle', sub: 'Order received' },
  { key: 'preparing', icon: 'restaurant', sub: 'Cooking your food' },
  { key: 'rider_pickup', icon: 'pedal-bike', sub: 'Rider at restaurant' },
  { key: 'on_the_way', icon: 'directions-bike', sub: 'Heading to you' },
  { key: 'delivered', icon: 'home', sub: 'Enjoy your meal' },
];

export function OrderTimeline({ current }: Props) {
  const currentIndex = STAGES.findIndex((s) => s.key === current);
  return (
    <View style={styles.wrap}>
      {STAGES.map((s, idx) => {
        const done = idx <= currentIndex;
        const active = idx === currentIndex;
        return (
          <View key={s.key} style={styles.row}>
            <View style={styles.left}>
              <View
                style={[
                  styles.dot,
                  done && { backgroundColor: colors.primary, borderColor: colors.primaryDark },
                  active && styles.activeDot,
                ]}
              >
                <MaterialIcons
                  name={s.icon}
                  size={16}
                  color={done ? colors.text : colors.textSubtle}
                />
              </View>
              {idx < STAGES.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    idx < currentIndex && { backgroundColor: colors.primaryDark },
                  ]}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, paddingBottom: spacing.lg }}>
              <Text style={[styles.title, !done && { color: colors.textMuted }]}>
                {STATUS_LABELS[s.key]}
              </Text>
              <Text style={styles.sub}>{s.sub}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.lg },
  row: { flexDirection: 'row' },
  left: { width: 40, alignItems: 'center' },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    transform: [{ scale: 1.1 }],
  },
  connector: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  title: { ...typography.bodyStrong, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
