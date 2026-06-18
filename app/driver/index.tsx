import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  AvailableOrderCard,
  Button,
  Card,
  Pill,
  Screen,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useDriver } from '@/hooks/useDriver';
import { useLocale } from '@/hooks/useLocale';
import { useAlert } from '@/template';
import { DRIVER_STAGE_LABELS } from '@/services/driver';
import { APP } from '@/constants/config';
import {
  VEHICLE_RATES,
  VehicleType,
  getVehicleRate,
} from '@/constants/adminSettings';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function DriverDashboard() {
  const router = useRouter();
  const { user, loading, setDriverMode } = useAuth();
  const { showAlert } = useAlert();
  const { locale, t } = useLocale();
  const ar = locale === 'ar';
  const {
    isOnline,
    setOnline,
    vehicleType,
    setVehicleType,
    available,
    active,
    history,
    stats,
    refreshQueue,
    acceptOrder,
    declineOrder,
  } = useDriver();

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  const stageLabel = active ? DRIVER_STAGE_LABELS[active.stage] : '';
  const availableForMe = available.filter((o) => o.vehicleType === vehicleType);
  const myRate = getVehicleRate(vehicleType);
  const myVehicleName = ar ? myRate.nameAr : myRate.nameEn;

  const handleAccept = (id: string) => {
    if (active) {
      showAlert(
        'Finish current delivery',
        'Complete or cancel your active delivery before accepting another.'
      );
      return;
    }
    const ok = acceptOrder(id);
    if (ok) router.push('/driver/active');
  };

  const handleVehicleChange = (v: VehicleType) => {
    if (active) {
      showAlert(
        ar ? 'الانتهاء من التوصيل أولاً' : 'Finish current delivery first',
        ar
          ? 'لا يمكن تغيير المركبة أثناء وجود طلب نشط.'
          : 'You cannot change your vehicle while a delivery is in progress.'
      );
      return;
    }
    setVehicleType(v);
  };

  const switchToCustomer = async () => {
    await setDriverMode(false);
    router.replace('/(tabs)');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.avatar}>
              <MaterialIcons name="pedal-bike" size={22} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{user.name}</Text>
              <Text style={styles.heroSub}>Bicycle rider · {APP.city}</Text>
            </View>
            <Pressable onPress={switchToCustomer} style={styles.switchBtn} hitSlop={6}>
              <MaterialIcons name="swap-horiz" size={14} color={colors.text} />
              <Text style={styles.switchText}>Customer</Text>
            </Pressable>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4ADE80' : '#7A7A7A' }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>YOU ARE</Text>
              <Text style={styles.statusValue}>{isOnline ? 'Online & ready' : 'Offline'}</Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={setOnline}
              trackColor={{ true: colors.primary, false: '#3a3a3a' }}
              thumbColor={isOnline ? colors.primaryDark : '#e5e5e5'}
            />
          </View>

          <View style={styles.statRow}>
            <Stat label="TODAY" value={`${stats.todayDeliveries}`} sub="trips" />
            <View style={styles.statDivider} />
            <Stat label="TODAY" value={`EGP ${stats.todayEarnings}`} sub="earned" />
            <View style={styles.statDivider} />
            <Stat label="ALL TIME" value={`${stats.totalDeliveries}`} sub="deliveries" />
          </View>
        </View>

        {/* Vehicle picker */}
        <Card>
          <View style={styles.vehHeaderRow}>
            <View style={styles.vehHeaderIcon}>
              <MaterialIcons name={myRate.icon as any} size={18} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{t('selectVehicle')}</Text>
              <Text style={styles.vehSub}>{t('selectVehicleSub')}</Text>
            </View>
            <Pill label={myVehicleName} tone="primary" />
          </View>
          <View style={styles.vehChipRow}>
            {VEHICLE_RATES.filter((r) => r.active).map((r) => {
              const activeChip = r.id === vehicleType;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => handleVehicleChange(r.id)}
                  style={[styles.vehChip, activeChip && styles.vehChipActive]}
                >
                  <View
                    style={[
                      styles.vehChipIcon,
                      activeChip && styles.vehChipIconActive,
                    ]}
                  >
                    <MaterialIcons
                      name={r.icon as any}
                      size={20}
                      color={activeChip ? colors.text : colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.vehChipText,
                      activeChip && styles.vehChipTextActive,
                    ]}
                  >
                    {ar ? r.nameAr : r.nameEn}
                  </Text>
                  <Text style={styles.vehChipMode}>
                    {r.mode === 'flat'
                      ? `EGP ${r.flatFee} · ${t('flatRate')}`
                      : `EGP ${r.perKmFee}${t('perKmShort')}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Active order banner */}
        {active ? (
          <Pressable
            onPress={() => router.push('/driver/active')}
            style={({ pressed }) => [styles.activeBanner, pressed && { opacity: 0.95 }]}
          >
            <View style={styles.activePulse}>
              <MaterialIcons name="navigation" size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Active delivery · {stageLabel}</Text>
              <Text style={styles.activeSub} numberOfLines={1}>
                {active.restaurant.name} → {active.customer.name}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.text} />
          </Pressable>
        ) : null}

        {/* Available orders header */}
        <View style={styles.sectionRow}>
          <Text style={styles.section}>
            Available pickups{isOnline ? ` · ${availableForMe.length}` : ''}
          </Text>
          {isOnline ? (
            <Pressable onPress={refreshQueue} hitSlop={6} style={styles.refreshBtn}>
              <MaterialIcons name="refresh" size={14} color={colors.text} />
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          ) : null}
        </View>

        {!isOnline ? (
          <Card>
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="wifi-off" size={26} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>You are offline</Text>
              <Text style={styles.emptySub}>
                Go online to start receiving delivery requests in {APP.city}.
              </Text>
              <Button label="Go online" onPress={() => setOnline(true)} />
            </View>
          </Card>
        ) : availableForMe.length === 0 ? (
          <Card>
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name={myRate.icon as any} size={26} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>{t('noVehicleOrders')}</Text>
              <Text style={styles.emptySub}>
                {t('noVehicleOrdersSub')} · {myVehicleName}
              </Text>
            </View>
          </Card>
        ) : (
          availableForMe.map((o) => (
            <AvailableOrderCard
              key={o.id}
              order={o}
              onAccept={() => handleAccept(o.id)}
              onDecline={() => declineOrder(o.id)}
              disabled={!!active}
            />
          ))
        )}

        {/* History */}
        {history.length > 0 ? (
          <>
            <Text style={[styles.section, { marginTop: spacing.lg }]}>Recent deliveries</Text>
            <Card padded={false}>
              {history.slice(0, 5).map((h, idx, arr) => (
                <View
                  key={h.id}
                  style={[styles.historyRow, idx < arr.length - 1 && styles.historyDivider]}
                >
                  <View
                    style={[
                      styles.historyIcon,
                      h.stage === 'delivered' ? styles.iconOk : styles.iconNo,
                    ]}
                  >
                    <MaterialIcons
                      name={h.stage === 'delivered' ? 'check' : 'close'}
                      size={16}
                      color={h.stage === 'delivered' ? colors.success : colors.danger}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle} numberOfLines={1}>
                      {h.restaurant.name} → {h.customer.name}
                    </Text>
                    <Text style={styles.historySub}>
                      {h.stage === 'delivered' ? `+EGP ${h.earnings}` : 'Cancelled'} ·{' '}
                      {h.distanceKm.toFixed(1)} km
                    </Text>
                  </View>
                  <Pill
                    label={h.stage === 'delivered' ? 'Delivered' : 'Cancelled'}
                    tone={h.stage === 'delivered' ? 'success' : 'danger'}
                  />
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statSubLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#1A1A1A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.pop,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: { ...typography.section, color: '#fff' },
  heroSub: { ...typography.caption, color: '#B8B8B8', marginTop: 2 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 4,
  },
  switchText: { ...typography.micro, color: colors.text, fontWeight: '800' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#262626',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { ...typography.micro, color: '#A8A8A8', fontWeight: '800', letterSpacing: 0.5 },
  statusValue: { ...typography.bodyStrong, color: '#fff', marginTop: 2 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: '#3a3a3a' },
  statSubLabel: {
    ...typography.micro,
    color: '#A8A8A8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statValue: { ...typography.bodyStrong, color: '#fff', marginTop: 2 },
  statSub: { ...typography.micro, color: '#888', marginTop: 1 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
    ...shadows.soft,
  },
  activePulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: { ...typography.bodyStrong, color: colors.text },
  activeSub: { ...typography.caption, color: colors.text, marginTop: 1 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  section: { ...typography.section, color: colors.text },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshText: { ...typography.micro, color: colors.text, fontWeight: '700' },
  vehHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  vehHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  vehChipRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  vehChip: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  vehChipActive: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primarySoft,
  },
  vehChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehChipIconActive: { backgroundColor: colors.primary },
  vehChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  vehChipTextActive: { color: colors.text, fontWeight: '800' },
  vehChipMode: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  empty: { alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.section, color: colors.text },
  emptySub: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  historyDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOk: { backgroundColor: colors.successSoft },
  iconNo: { backgroundColor: '#FBE2E1' },
  historyTitle: { ...typography.bodyStrong, color: colors.text },
  historySub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
});
