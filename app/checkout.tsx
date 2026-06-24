import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  AddressPicker,
  Button,
  Card,
  Header,
  Input,
  Pill,
  Screen,
  VehicleSelector,
} from '@/components';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { useLocale } from '@/hooks/useLocale';
import { useAlert } from '@/template';
import { PAYMENT_METHODS, PaymentMethodId, SADAT_CENTER } from '@/constants/config';
import { getVehicleRate } from '@/constants/adminSettings';
import { buildOrder } from '@/services/orders';
import { verifyPayment } from '@/services/payment';
import { distanceKm } from '@/services/tracking';
import {
  calculateVehicleFee,
  estimateVehicleRideMinutes,
} from '@/services/vehicles';
import { getEffectiveLocation } from '@/services/geofence';
import { OsmAddressResult } from '@/services/openstreetmap';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function Checkout() {
  const router = useRouter();
  const { lines, restaurant, subtotal, clear, vehicleType, setVehicleType } = useCart();
  const { user, consumeFreeDelivery, setAddress } = useAuth();
  const { addOrder, updateOrder } = useOrders();
  const { t } = useLocale();
  const { showAlert } = useAlert();

  const [method, setMethod] = useState<PaymentMethodId>('cash');
  const [address, setAddressLocal] = useState(user?.address || user?.area || '');
  const [notes, setNotes] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | undefined>();
  const [useFreeDelivery, setUseFreeDelivery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  if (!restaurant || lines.length === 0) {
    return (
      <Screen>
        <Header title={t('checkout')} />
        <View style={{ padding: spacing.xl }}>
          <Text style={{ ...typography.body, color: colors.textMuted, textAlign: 'right' }}>
            {t('emptyCart')}
          </Text>
        </View>
      </Screen>
    );
  }

  const userLoc = getEffectiveLocation(user);
  const dist = distanceKm(userLoc, restaurant.location);
  const vehicleRate = getVehicleRate(vehicleType);
  const baseFee = calculateVehicleFee(vehicleRate, dist);
  const rideMin = estimateVehicleRideMinutes(vehicleRate, dist);
  const totalMin = restaurant.prepTimeMin + rideMin;
  const freeDelivery = useFreeDelivery && (user?.freeDeliveries ?? 0) > 0;
  const fee = freeDelivery ? 0 : baseFee;
  const total = subtotal + fee;
  const vehicleName = vehicleRate.nameAr;

  const pickScreenshot = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert(t('permissionNeeded'), t('permissionPhotos'));
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
      setScreenshotUri('mock://screenshot.png');
    }
  };

  const handleSelectAddress = async (r: OsmAddressResult) => {
    setAddressLocal(r.shortName);
    await setAddress({ address: r.shortName, area: r.area, addressLocation: r.location });
  };

  const placeOrder = async () => {
    if (!user || !restaurant) return;
    if (!address.trim()) {
      showAlert(t('addressNeeded'), t('enterAddress'));
      return;
    }
    const requiresProof = PAYMENT_METHODS.find((m) => m.id === method)?.requiresProof;
    if (requiresProof && !screenshotUri) {
      showAlert(t('uploadRequired'), t('uploadRequiredBody'));
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
      customerPosition: user.addressLocation || {
        lat: SADAT_CENTER.lat + 0.003,
        lng: SADAT_CENTER.lng + 0.002,
      },
      freeDelivery,
      vehicleType,
      vehicleFee: baseFee,
      estimatedMinutes: totalMin,
    });
    await addOrder(order);

    if (requiresProof) {
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
        showAlert(t('verificationFailed'), result.reason);
        return;
      }
    }

    clear();
    setSubmitting(false);
    showAlert(t('orderPlaced'), t('trackLive'), [
      { text: t('trackNow'), onPress: () => router.replace(`/track/${order.id}`) },
    ]);
  };

  return (
    <Screen>
      <Header title={t('checkout')} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 140 }}>
        {/* Address */}
        <Card>
          <Text style={styles.section}>{t('deliveryTo')}</Text>
          <Pressable onPress={() => setPickerVisible(true)} style={styles.addressTrigger}>
            <MaterialIcons name="location-on" size={18} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              {address ? (
                <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
              ) : (
                <Text style={styles.addressPlaceholder}>{t('pickAddress')}</Text>
              )}
            </View>
            <MaterialIcons name="edit-location-alt" size={18} color={colors.textMuted} />
          </Pressable>
          <Input
            label={t('riderNotes')}
            placeholder={t('callOnArrival')}
            value={notes}
            onChangeText={setNotes}
            iconLeft={<MaterialIcons name="comment" size={18} color={colors.textMuted} />}
          />
          <View style={styles.geo}>
            <MaterialIcons name="check-circle" size={14} color={colors.success} />
            <Text style={styles.geoText}>{t('insideGeofence')}</Text>
          </View>
        </Card>

        {/* Vehicle */}
        <Card>
          <View style={styles.vehHeaderRow}>
            <View style={styles.vehHeaderIcon}>
              <MaterialIcons name="local-shipping" size={18} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{t('chooseVehicle')}</Text>
              <Text style={styles.vehSub}>{t('chooseVehicleSub')}</Text>
            </View>
          </View>
          <View style={{ height: spacing.md }} />
          <VehicleSelector distKm={dist} value={vehicleType} onChange={setVehicleType} />
          <View style={styles.timeBanner}>
            <MaterialIcons name="schedule" size={14} color={colors.primaryDark} />
            <Text style={styles.timeBannerText}>
              {totalMin} دقيقة إجمالاً ({restaurant.prepTimeMin} {t('prepLabel')} + {rideMin} {t('rideLabel')})
            </Text>
          </View>
        </Card>

        {/* Payment */}
        <Card>
          <Text style={styles.section}>{t('paymentMethod')}</Text>
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
                  {m.requiresProof ? <Pill label="تحقق ذكي" tone="warning" /> : null}
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {PAYMENT_METHODS.find((m) => m.id === method)?.requiresProof ? (
            <View style={styles.proof}>
              <Text style={styles.proofTitle}>{t('uploadProofTitle')}</Text>
              <Text style={styles.proofSub}>{t('uploadProofSub')}</Text>
              <Pressable onPress={pickScreenshot} style={styles.uploader}>
                {screenshotUri ? (
                  <View style={styles.uploadOk}>
                    <MaterialIcons name="check-circle" size={22} color={colors.success} />
                    <Text style={styles.uploadOkText}>{t('proofAttached')}</Text>
                  </View>
                ) : (
                  <View style={styles.uploadEmpty}>
                    <MaterialIcons name="cloud-upload" size={26} color={colors.textMuted} />
                    <Text style={styles.uploadText}>{t('tapToUpload')}</Text>
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
                <Text style={styles.freeTitle}>{t('useFreeVoucher')}</Text>
                <Text style={styles.freeSub}>{t('vouchersAvailable')}: {user?.freeDeliveries}</Text>
              </View>
              <View style={[styles.toggle, useFreeDelivery && styles.toggleOn]}>
                <View style={[styles.toggleDot, useFreeDelivery && { left: 22 }]} />
              </View>
            </Pressable>
          </Card>
        ) : null}

        {/* Receipt */}
        <Card>
          <Text style={styles.section}>{t('orderSummary')}</Text>
          {lines.map((l) => (
            <View key={l.item.id} style={styles.recRow}>
              <Text style={styles.recLabel}>{l.qty} × {l.item.nameAr}</Text>
              <Text style={styles.recValue}>{(l.item.price * l.qty).toFixed(0)} ج.م</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.recRow}>
            <Text style={styles.recLabel}>{t('subtotal')}</Text>
            <Text style={styles.recValue}>{subtotal.toFixed(0)} ج.م</Text>
          </View>
          <View style={styles.feeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recLabel}>{t('deliveryFeeLabel')}</Text>
              <Text style={styles.feeMeta}>
                {t('deliveryVia')} {vehicleName} · {rideMin} {t('minShort')}
                {dist > 0 ? ` · ${dist.toFixed(1)} كم` : ''}
              </Text>
            </View>
            <Text style={[styles.recValue, freeDelivery && { color: colors.success }]}>
              {freeDelivery ? t('deliveryFree') : `${baseFee.toFixed(0)} ج.م`}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.recRow}>
            <Text style={[styles.recLabel, { color: colors.text, fontWeight: '700' }]}>{t('total')}</Text>
            <Text style={[styles.recValue, { ...typography.title }]}>{total.toFixed(0)} ج.م</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={submitting ? t('verifying') : `${t('placeOrder')} · ${total.toFixed(0)} ج.م`}
          loading={submitting}
          onPress={placeOrder}
        />
      </View>

      <AddressPicker
        visible={pickerVisible}
        initialQuery={address}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectAddress}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm, textAlign: 'right' },
  addressTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderRadius: radius.md, backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  addressText: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  addressPlaceholder: { ...typography.body, color: colors.textSubtle, textAlign: 'right' },
  vehHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  vehHeaderIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  vehSub: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  timeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md,
    paddingVertical: 8, borderRadius: radius.md, marginTop: spacing.md,
  },
  timeBannerText: { ...typography.micro, color: colors.text, fontWeight: '700', flex: 1 },
  feeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  feeMeta: { ...typography.micro, color: colors.textMuted, marginTop: 2, fontWeight: '600', textAlign: 'right' },
  geo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  geoText: { ...typography.caption, color: colors.success, fontWeight: '700' },
  method: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1, borderColor: colors.border,
  },
  methodActive: { borderColor: colors.primaryDark, backgroundColor: colors.primarySoft },
  methodIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { ...typography.bodyStrong, color: colors.text, flex: 1, textAlign: 'right' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primaryDark, backgroundColor: '#fff' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primaryDark },
  proof: { marginTop: spacing.md },
  proofTitle: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  proofSub: { ...typography.caption, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  uploader: {
    marginTop: spacing.md, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    padding: spacing.lg, backgroundColor: colors.surfaceAlt,
  },
  uploadEmpty: { alignItems: 'center', gap: 6 },
  uploadText: { ...typography.caption, color: colors.textMuted },
  uploadOk: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  uploadOkText: { ...typography.bodyStrong, color: colors.success },
  freeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  freeTitle: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  freeSub: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: colors.surfaceMuted, padding: 2, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#fff', position: 'absolute', left: 2, ...shadows.soft,
  },
  recRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  recLabel: { ...typography.body, color: colors.textMuted },
  recValue: { ...typography.bodyStrong, color: colors.text },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
});
