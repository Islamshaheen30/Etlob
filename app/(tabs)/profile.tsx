import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, Pill, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useDriver } from '@/hooks/useDriver';
import { useAlert } from '@/template';
import { APP, REFERRAL } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function ProfileTab() {
  const router = useRouter();
  const { user, loading, logout, applyReferral, setDriverMode } = useAuth();
  const { stats } = useDriver();
  const { showAlert } = useAlert();

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  const progress = user.referredCount % REFERRAL.goal;
  const ratio = progress / REFERRAL.goal;

  const handleLogout = () => {
    showAlert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const simulateReferral = async () => {
    await applyReferral();
    showAlert('Friend joined!', 'Thanks for spreading the word — keep going!');
  };

  const handleDriverToggle = async (v: boolean) => {
    await setDriverMode(v);
    if (v) router.replace('/driver');
  };

  return (
    <Screen>
      <Header title="Profile" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl }}>
        {/* Identity */}
        <Card>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.contact}>{user.email || user.phone}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                <Pill
                  label={user.area}
                  tone="neutral"
                  icon={<MaterialIcons name="location-on" size={12} color={colors.textMuted} />}
                />
                <Pill label={APP.city} tone="primary" />
              </View>
            </View>
          </View>
        </Card>

        {/* Driver mode */}
        <View style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.driverIcon}>
              <MaterialIcons name="pedal-bike" size={22} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverTitle}>Driver mode</Text>
              <Text style={styles.driverSub}>
                Earn money delivering food across {APP.city}.
              </Text>
            </View>
            <Switch
              value={user.isDriver ?? false}
              onValueChange={handleDriverToggle}
              trackColor={{ true: colors.primaryDark, false: colors.surfaceMuted }}
              thumbColor={'#fff'}
            />
          </View>
          <View style={styles.driverStats}>
            <View style={styles.driverStat}>
              <Text style={styles.driverStatValue}>{stats.totalDeliveries}</Text>
              <Text style={styles.driverStatLabel}>Deliveries</Text>
            </View>
            <View style={styles.driverStatDivider} />
            <View style={styles.driverStat}>
              <Text style={styles.driverStatValue}>EGP {stats.totalEarnings}</Text>
              <Text style={styles.driverStatLabel}>Earned</Text>
            </View>
            <View style={styles.driverStatDivider} />
            <Pressable
              onPress={() => router.push('/driver')}
              style={styles.driverOpenBtn}
              hitSlop={6}
            >
              <Text style={styles.driverOpenText}>Open</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Referral */}
        <Card>
          <Text style={styles.section}>Refer & earn</Text>
          <Text style={styles.subtle}>
            Invite {REFERRAL.goal} friends and unlock {REFERRAL.reward}.
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Your referral code</Text>
            <Text style={styles.code}>{user.referralCode}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress} / {REFERRAL.goal} referrals · {user.freeDeliveries} free delivery vouchers
          </Text>

          <View style={styles.refRow}>
            <Button
              label="Share my code"
              variant="outline"
              fullWidth={false}
              style={{ flex: 1 }}
              iconLeft={<MaterialIcons name="ios-share" size={16} color={colors.text} />}
              onPress={() =>
                showAlert(
                  'Share your code',
                  `Send "${user.referralCode}" to friends in ${APP.city} so they get a discount and you earn deliveries.`
                )
              }
            />
            <View style={{ width: spacing.sm }} />
            <Button
              label="Simulate friend"
              fullWidth={false}
              style={{ flex: 1 }}
              onPress={simulateReferral}
            />
          </View>
        </Card>

        {/* Settings */}
        <Card padded={false}>
          <Row icon="payment" label="Payment methods" onPress={() => showAlert('Payment methods', 'Cash, Vodafone Cash and InstaPay are supported in Al-Sadat.')} />
          <Row icon="location-on" label="Delivery addresses" onPress={() => showAlert('Addresses', `Currently saved: ${user.area}, ${APP.city}.`)} />
          <Row icon="help-outline" label="Help & support" onPress={() => showAlert('Support', 'Reach our team at support@etlob.app — we reply within an hour.')} />
          <Row icon="info-outline" label="About Etlob" onPress={() => showAlert(`${APP.name} (${APP.nameAr})`, `Bicycle-powered food delivery for ${APP.city}.`)} />
        </Card>

        <Button label="Sign out" variant="outline" onPress={handleLogout} />
      </ScrollView>
    </Screen>
  );
}

function Row({ icon, label, onPress }: { icon: any; label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={18} color={colors.text} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.title, color: colors.text },
  name: { ...typography.section, color: colors.text },
  contact: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  section: { ...typography.section, color: colors.text },
  subtle: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  codeBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  codeLabel: { ...typography.caption, color: colors.textMuted },
  code: { ...typography.title, color: colors.text, letterSpacing: 2, marginTop: 4 },
  progressTrack: {
    marginTop: spacing.md,
    height: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  refRow: { flexDirection: 'row', marginTop: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, color: colors.text, flex: 1 },
  driverCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.pop,
  },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  driverIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverTitle: { ...typography.section, color: '#fff' },
  driverSub: { ...typography.caption, color: '#B8B8B8', marginTop: 2 },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  driverStat: { flex: 1, alignItems: 'center' },
  driverStatValue: { ...typography.bodyStrong, color: '#fff' },
  driverStatLabel: { ...typography.micro, color: '#A8A8A8', marginTop: 2, fontWeight: '700' },
  driverStatDivider: { width: 1, height: 28, backgroundColor: '#3a3a3a' },
  driverOpenBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginHorizontal: spacing.sm,
  },
  driverOpenText: { ...typography.micro, color: colors.text, fontWeight: '800' },
});
