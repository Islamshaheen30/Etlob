import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, Screen } from '@/components';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { colors, radius, spacing, typography } from '@/constants/theme';

export default function CartPage() {
  const router = useRouter();
  const { lines, restaurant, subtotal, setQty, clear } = useCart();
  const { user } = useAuth();

  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title="Your cart"
        right={
          lines.length > 0 ? (
            <Pressable onPress={clear} hitSlop={8}>
              <Text style={styles.clear}>Clear</Text>
            </Pressable>
          ) : null
        }
      />

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <Image source={require('@/assets/images/empty-cart.png')} style={styles.emptyImg} contentFit="contain" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from a restaurant to continue.</Text>
          <Button label="Browse restaurants" onPress={() => router.replace('/(tabs)')} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 220 }}>
            {restaurant ? (
              <Card>
                <View style={styles.row}>
                  <Image source={{ uri: restaurant.image }} style={styles.thumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{restaurant.name}</Text>
                    <Text style={styles.sub}>
                      {restaurant.cuisine} · {restaurant.etaMin} min ETA
                    </Text>
                  </View>
                </View>
              </Card>
            ) : null}

            <Card padded={false}>
              {lines.map((l) => (
                <View key={l.item.id} style={styles.line}>
                  <Image source={{ uri: l.item.image }} style={styles.lineImg} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineName}>{l.item.name}</Text>
                    <Text style={styles.linePrice}>EGP {l.item.price} each</Text>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable onPress={() => setQty(l.item.id, l.qty - 1)} style={styles.stepBtn} hitSlop={6}>
                      <MaterialIcons name="remove" size={16} color={colors.text} />
                    </Pressable>
                    <Text style={styles.qty}>{l.qty}</Text>
                    <Pressable onPress={() => setQty(l.item.id, l.qty + 1)} style={styles.stepBtn} hitSlop={6}>
                      <MaterialIcons name="add" size={16} color={colors.text} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </Card>

            <Card>
              <Text style={styles.section}>Receipt</Text>
              <Row label="Subtotal" value={`EGP ${subtotal.toFixed(0)}`} />
              <Row label="Delivery fee" value={`EGP ${deliveryFee.toFixed(0)}`} />
              {user && user.freeDeliveries > 0 ? (
                <Row label="Free delivery vouchers" value={`${user.freeDeliveries} available`} muted />
              ) : null}
              <View style={styles.divider} />
              <Row label="Total" value={`EGP ${total.toFixed(0)}`} bold />
            </Card>
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>Total</Text>
              <Text style={styles.footerValue}>EGP {total.toFixed(0)}</Text>
            </View>
            <Button
              label="Checkout"
              fullWidth={false}
              style={{ flex: 1, marginLeft: spacing.lg }}
              onPress={() => router.push('/checkout')}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <View style={styles.recRow}>
      <Text style={[styles.recLabel, muted && { color: colors.success, fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.recValue, bold && { ...typography.title, color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clear: { ...typography.caption, color: colors.danger, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyImg: { width: 160, height: 160 },
  emptyTitle: { ...typography.section, color: colors.text },
  emptySub: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  title: { ...typography.bodyStrong, color: colors.text },
  sub: { ...typography.caption, color: colors.textMuted },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  lineImg: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  lineName: { ...typography.bodyStrong, color: colors.text },
  linePrice: { ...typography.caption, color: colors.textMuted },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  qty: { ...typography.bodyStrong, color: colors.text, minWidth: 22, textAlign: 'center' },
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  recLabel: { ...typography.body, color: colors.textMuted },
  recValue: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLabel: { ...typography.caption, color: colors.textMuted },
  footerValue: { ...typography.title, color: colors.text },
});
