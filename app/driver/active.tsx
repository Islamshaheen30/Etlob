import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, Pill, RiderMap, Screen } from '@/components';
import { useDriver } from '@/hooks/useDriver';
import { useAlert } from '@/template';
import { DRIVER_STAGE_LABELS, DriverOrderStage } from '@/services/driver';
import { distanceKm } from '@/services/tracking';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

const STAGE_FLOW: DriverOrderStage[] = [
  'going_to_restaurant',
  'at_restaurant',
  'going_to_customer',
  'delivered',
];

export default function DriverActive() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { active, arriveAtRestaurant, pickUp, markDelivered, cancelActive } = useDriver();

  if (!active) return <Redirect href="/driver" />;

  const target =
    active.stage === 'going_to_customer' ? active.customerPosition : active.restaurantPosition;
  const dist = active.riderPosition ? distanceKm(active.riderPosition, target) : 0;

  const stageIndex = STAGE_FLOW.indexOf(active.stage);

  const callCustomer = () =>
    showAlert(
      'Call customer',
      `${active.customer.name} · ${active.customer.phone}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Call', onPress: () => {} },
      ]
    );

  const handleCancel = () =>
    showAlert(
      'Cancel delivery?',
      'You will not earn this delivery and the order will be marked cancelled.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Cancel delivery',
          style: 'destructive',
          onPress: () => {
            cancelActive();
            router.replace('/driver');
          },
        },
      ]
    );

  const handleDelivered = () => {
    showAlert('Mark as delivered?', 'Confirm the customer received their order.', [
      { text: 'Not yet', style: 'cancel' },
      {
        text: 'Yes, delivered',
        onPress: () => {
          const earnings = active.earnings;
          markDelivered();
          showAlert('Delivery completed', `+EGP ${earnings} added to your earnings.`, [
            { text: 'Done', onPress: () => router.replace('/driver') },
          ]);
        },
      },
    ]);
  };

  const primaryAction = (() => {
    if (active.stage === 'going_to_restaurant') {
      return { label: 'Mark arrived at restaurant', onPress: arriveAtRestaurant, icon: 'restaurant' };
    }
    if (active.stage === 'at_restaurant') {
      return { label: 'Confirm picked up', onPress: pickUp, icon: 'shopping-bag' };
    }
    if (active.stage === 'going_to_customer') {
      return { label: 'Mark delivered', onPress: handleDelivered, icon: 'check-circle' };
    }
    return null;
  })();

  return (
    <Screen>
      <Header
        title="Active delivery"
        subtitle={`#${active.id.slice(-6).toUpperCase()}`}
        right={
          <Pressable onPress={() => router.replace('/driver')} hitSlop={8}>
            <MaterialIcons name="dashboard" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 140 }}
      >
        {/* Status */}
        <Card>
          <View style={styles.statusRow}>
            <View style={{ flex: 1 }}>
              <Pill label={DRIVER_STAGE_LABELS[active.stage]} tone="primary" />
              <Text style={styles.eta}>{dist.toFixed(2)} km away</Text>
              <Text style={styles.subtle}>
                {active.stage === 'going_to_customer'
                  ? `Heading to ${active.customer.name}`
                  : `Heading to ${active.restaurant.name}`}
              </Text>
            </View>
            <View style={styles.bigIcon}>
              <MaterialIcons name="pedal-bike" size={28} color={colors.text} />
            </View>
          </View>
        </Card>

        {/* Map */}
        {active.riderPosition ? (
          <RiderMap
            rider={active.riderPosition}
            customer={active.customerPosition}
            restaurant={active.restaurantPosition}
            height={260}
          />
        ) : null}

        {/* Stage progression */}
        <Card padded={false}>
          <View style={{ padding: spacing.lg, paddingBottom: spacing.sm }}>
            <Text style={styles.section}>Delivery steps</Text>
          </View>
          <Step
            done={stageIndex >= 0}
            active={active.stage === 'going_to_restaurant'}
            title="Pickup at restaurant"
            sub={`${active.restaurant.name} · ${active.restaurant.nameAr}`}
            icon="restaurant"
          />
          <Step
            done={stageIndex >= 1}
            active={active.stage === 'at_restaurant'}
            title="Verify items & pickup"
            sub={`${active.items.reduce((s, i) => s + i.qty, 0)} items to verify`}
            icon="check-circle"
          />
          <Step
            done={stageIndex >= 2}
            active={active.stage === 'going_to_customer'}
            title="Deliver to customer"
            sub={`${active.customer.name} · ${active.customer.area}`}
            icon="home"
          />
          <Step
            done={stageIndex >= 3}
            active={false}
            title={
              active.paymentMethod === 'cash'
                ? `Collect EGP ${active.total} cash`
                : 'Complete delivery'
            }
            sub={
              active.paymentMethod === 'cash'
                ? 'Customer pays on arrival'
                : 'Payment verified by AI'
            }
            icon="payments"
            last
          />
        </Card>

        {/* Customer (after pickup) or restaurant (before pickup) */}
        {active.stage === 'going_to_customer' || active.stage === 'at_restaurant' ? (
          <Card>
            <Text style={styles.section}>Customer</Text>
            <View style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>{active.customer.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{active.customer.name}</Text>
                <Text style={styles.subtle}>{active.customer.phone}</Text>
              </View>
              <Pressable onPress={callCustomer} style={styles.callBtn} hitSlop={6}>
                <MaterialIcons name="phone" size={18} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.addressBox}>
              <MaterialIcons name="location-on" size={16} color={colors.primaryDark} />
              <Text style={styles.addressText}>
                {active.customer.address}, {active.customer.area}
              </Text>
            </View>
            {active.notes ? (
              <View style={styles.noteBox}>
                <MaterialIcons name="comment" size={14} color={'#A06400'} />
                <Text style={styles.noteText}>{active.notes}</Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <Card>
            <Text style={styles.section}>Restaurant</Text>
            <View style={styles.contactRow}>
              <View style={[styles.contactAvatar, { backgroundColor: colors.primarySoft }]}>
                <MaterialIcons name="restaurant" size={20} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{active.restaurant.name}</Text>
                <Text style={styles.subtle}>{active.restaurant.nameAr}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Items & payment */}
        <Card>
          <Text style={styles.section}>Order items</Text>
          {active.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.qtyChip}>
                <Text style={styles.qtyText}>{it.qty}×</Text>
              </View>
              <Text style={styles.itemName}>{it.name}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.payRow}>
            <Text style={styles.subtle}>
              {active.paymentMethod === 'cash' ? 'Cash on delivery' : 'Online payment'}
            </Text>
            <Text style={styles.totalText}>EGP {active.total}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.subtle}>Your earnings</Text>
            <Text style={[styles.totalText, { color: colors.success }]}>
              + EGP {active.earnings}
            </Text>
          </View>
        </Card>

        <Pressable onPress={handleCancel} style={styles.cancelBtn} hitSlop={6}>
          <MaterialIcons name="close" size={16} color={colors.danger} />
          <Text style={styles.cancelText}>Cancel this delivery</Text>
        </Pressable>
      </ScrollView>

      {primaryAction ? (
        <View style={styles.footer}>
          <Button
            label={primaryAction.label}
            onPress={primaryAction.onPress}
            iconLeft={
              <MaterialIcons name={primaryAction.icon as any} size={18} color={colors.text} />
            }
          />
        </View>
      ) : null}
    </Screen>
  );
}

interface StepProps {
  done: boolean;
  active: boolean;
  title: string;
  sub: string;
  icon: any;
  last?: boolean;
}

function Step({ done, active, title, sub, icon, last }: StepProps) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepLeft}>
        <View
          style={[
            styles.stepDot,
            done && { backgroundColor: colors.primary, borderColor: colors.primaryDark },
            active && styles.stepActive,
          ]}
        >
          <MaterialIcons name={icon} size={16} color={done ? colors.text : colors.textSubtle} />
        </View>
        {!last ? (
          <View style={[styles.connector, done && { backgroundColor: colors.primaryDark }]} />
        ) : null}
      </View>
      <View
        style={{
          flex: 1,
          paddingBottom: last ? spacing.lg : spacing.md,
          paddingRight: spacing.lg,
        }}
      >
        <Text style={[styles.stepTitle, !done && { color: colors.textMuted }]}>{title}</Text>
        <Text style={styles.stepSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  eta: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  subtle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  bigIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  section: { ...typography.section, color: colors.text, marginBottom: spacing.sm },
  stepRow: { flexDirection: 'row', paddingHorizontal: spacing.lg },
  stepLeft: { width: 40, alignItems: 'center' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: { transform: [{ scale: 1.12 }], borderColor: colors.primaryDark },
  connector: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  stepTitle: { ...typography.bodyStrong, color: colors.text },
  stepSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: { ...typography.bodyStrong, color: colors.text },
  contactName: { ...typography.bodyStrong, color: colors.text },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  addressText: { ...typography.caption, color: colors.text, fontWeight: '600', flex: 1 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF1D9',
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  noteText: { ...typography.caption, color: '#A06400', fontWeight: '600', flex: 1 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 6,
  },
  qtyChip: {
    minWidth: 36,
    paddingHorizontal: 6,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { ...typography.caption, fontWeight: '800', color: colors.text },
  itemName: { ...typography.body, color: colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalText: { ...typography.bodyStrong, color: colors.text },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  cancelText: { ...typography.caption, color: colors.danger, fontWeight: '700' },
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
