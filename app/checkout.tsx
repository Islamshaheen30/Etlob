import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Header, Input, Pill, Screen } from '@/components';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { PAYMENT_METHODS, PaymentMethodId, SADAT_CENTER } from '@/constants/config';
import { buildOrder } from '@/services/orders';
import { verifyPayment } from '@/services/payment';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function Checkout() {
  const router = useRouter();
  const { lines, restaurant, subtotal, clear } = useCart();
  const { user, consumeFreeDelivery } = useAuth();
  const { addOrder, updateOrder } = useOrders();
  const { showAlert } = useAlert();

  const [method, setMethod] = useState<PaymentMethodId>('cash');
  const [address, setAddress] = useState(user?.area || '');
  const [notes, setNotes] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | undefined>();
  const [useFreeDelivery, setUseFreeDelivery] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!restaurant || lines.length === 0) {
    return (
      <Screen>
        <Header title="Checkout" />
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted }}>Your cart is empty.</Text>
        </View>
      </Screen>
    );
  }

  const baseFee = restaurant.deliveryFee;
  const freeDelivery = useFreeDelivery && (user?.freeDeliveries ?? 0) > 0;
  const fee = freeDelivery ? 0 : baseFee;
  const total = subtotal + fee;

  const pickScreenshot = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert('Permission needed', 'Please allow photo access to upload your transfer screenshot.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setScreenshotUri(result.assets[0].uri);
      }
    } catch {
      // Fallback: simulate selected screenshot
      setScreenshotUri('mock://screenshot.png');
    }
  };

  const placeOrder = async () => {
    if (!user || !restaurant) return;
    if (!address.trim()) {
      showAlert('Address needed', 'Please enter your full delivery address.');
      return;
    }
    const requiresProof = PAYMENT_METHODS.find((m) => m.id === method)?.requiresProof;
    if (requiresProof && !screenshotUri) {
      showAlert('Upload required', 'Please upload the payment transfer screenshot for AI verification.');
      return;
    }

    setSubmitting(true);
    if (freeDelivery) await consumeFreeDelivery();

    const order = buildOrder({
      userId: user.id,
      restaurant,
      items: lines,
      paymentMethod: method,
      address: `${address}, ${user.area}`,
      notes,
      customerPosition: { lat: SADAT_CENTER.lat + 0.003, lng: SADAT_CENTER.lng + 0.002 },
      freeDelivery,
    });
    await addOrder(order);

    if (requiresProof) {
      // Run mock AI verification
      await updateOrder(order.id, { status: 'verifying', paymentProof: { uri: screenshotUri, verified: false } });
      const result = await verifyPayment({
        method: method as 'vodafone' | 'instapay',
        expectedAmount: total,
        screenshotUri,
      });
      if (result.verified) {
        await updateOrder(order.id, {
          status: 'confirmed',
          paymentProof: {
            uri: screenshotUri,
            verified: true,
            sender: result.sender,
            amount: result.amount,
          },
        });
      } else {
        await updateOrder(order.id, { status: 'pending_payment' });
        setSubmitting(false);
        showAlert('Verification failed', result.reason);
        return;
      }
    }

    clear();
    setSubmitting(false);
    showAlert('Order placed!', 'Track your bicycle rider in real time.', [
      { text: 'Track now', onPress: () => router.replace(`/track/${order.id}`) },
    ]);
  };

  return (
    <Screen>
      <Header title="Checkout" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 140 }}>
        {/* Address */}
        <Card>
          <Text style={styles.section}>Delivery to</Text>
          <Input
            label="Street, building, floor"
            placeholder="Block 12, Flat 5"
            value={address}
            onChangeText={setAddress}
            iconLeft={<MaterialIcons name="location-on" size={18} color={colors.textMuted} />}
          />
          <Input
            label="Notes for the rider (optional)"
            placeholder="Call when you arrive"
            value={notes}
            onChangeText={setNotes}
            iconLeft={<MaterialIcons name="comment" size={18} color={colors.textMuted} />}
          />
          <View style={styles.geo}>
            <MaterialIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.geoText}>Inside Al-Sadat geofence</Text>
          </View>
        </Card>

        {/* Payment */}
        <Card>
          <Text style={styles.section}>Payment method</Text>
          <View style={{ gap: spacing.sm }}>
            {PAYMENT_METHODS.map((m) => {
              const active = m.id === method;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => setMethod(m.id)}
                  style={[styles.method, active && styles.methodActive]}
                >
                  <View style={styles.methodIcon}>
                    <MaterialIcons name={m.icon as any} size={18} color={colors.text} />
                  </View>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  {m.requiresProof ? <Pill label="AI verify" tone="warning" /> : null}
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {PAYMENT_METHODS.find((m) => m.id === method)?.requiresProof ? (
            <View style={styles.proof}>
              <Text style={styles.proofTitle}>Upload transfer screenshot</Text>
              <Text style={styles.proofSub}>
                Our AI will match the amount and sender against incoming SMS to verify your payment automatically.
              </Text>
              <Pressable onPress={pickScreenshot} style={styles.uploader}>
                {screenshotUri ? (
                  <View style={styles.uploadOk}>
                    <MaterialIcons name="check-circle" size={22} color={colors.success} />
                    <Text style={styles.uploadOkText}>Screenshot attached · ready to verify</Text>
                  </View>
                ) : (
                  <View style={styles.uploadEmpty}>
                    <MaterialIcons name="cloud-upload" size={26} color={colors.textMuted} />
                    <Text style={styles.uploadText}>Tap to upload screenshot</Text>
                  </View>
                )}
              </Pressable>
            </View>
          ) : null}
        </Card>

        {/* Free delivery */}
        {(user?.freeDeliveries ?? 0) > 0 ? (
          <Card>
            <Pressable onPress={() => setUseFreeDelivery((v) => !v)} style={styles.freeRow}>
              <MaterialIcons name="card-giftcard" size={22} color={colors.primaryDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.freeTitle}>Use free delivery voucher</Text>
                <Text style={styles.freeSub}>You have {user?.freeDeliveries} available</Text>
              </View>
              <View style={[styles.toggle, useFreeDelivery && styles.toggleOn]}>
                <View style={[styles.toggleDot, useFreeDelivery && { left: 22 }]} />
              </View>
            </Pressable>
          </Card>
        ) : null}

        {/* Receipt */}
        <Card>
          <Text style={styles.section}>Order summary</Text>
          {lines.map((l) => (
            <View key={l.item.id} style={styles.recRow}>
              <Text style={styles.recLabel}>
                {l.qty} × {l.item.name}
              </Text>
              <Text style={styles.recValue}>EGP {(l.item.price * l.qty).toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Subtotal</Text>
            <Text style={styles.recValue}>EGP {subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>Delivery fee</Text>
            <Text style={[styles.recValue, freeDelivery && { color: colors.success }]}>
              {freeDelivery ? 'FREE' : `EGP ${baseFee.toFixed(0)}`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.recRow}>
            <Text style={[styles.recLabel, { color: colors.text, fontWeight: '700' }]}>Total</Text>
            <Text style={[styles.recValue, { ...typography.title }]}>EGP {total.toFixed(0)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? 'Verifying…' : `Place order · EGP ${total.toFixed(0)}`}
          loading={submitting}
          onPress={placeOrder}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm },
  geo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  geoText: { ...typography.caption, color: colors.success, fontWeight: '700' },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodActive: { borderColor: colors.primaryDark, backgroundColor: colors.primarySoft },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primaryDark, backgroundColor: '#fff' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
  proof: { marginTop: spacing.md },
  proofTitle: { ...typography.bodyStrong, color: colors.text },
  proofSub: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  uploader: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  uploadEmpty: { alignItems: 'center', gap: 6 },
  uploadText: { ...typography.caption, color: colors.textMuted },
  uploadOk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  uploadOkText: { ...typography.bodyStrong, color: colors.success },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  freeTitle: { ...typography.bodyStrong, color: colors.text },
  freeSub: { ...typography.caption, color: colors.textMuted },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 2,
    ...shadows.soft,
  },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  recLabel: { ...typography.body, color: colors.textMuted },
  recValue: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
