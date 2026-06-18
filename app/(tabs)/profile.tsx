import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Card, Header, Pill, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useDriver } from '@/hooks/useDriver';
import { useLocale } from '@/hooks/useLocale';
import { useAlert } from '@/template';
import { APP, REFERRAL } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function ProfileTab() {
  const router = useRouter();
  const { user, loading, logout, applyReferral, setDriverMode, setSimulateOutsideZone } = useAuth();
  const { stats } = useDriver();
  const { locale, setLocale, t } = useLocale();
  const { showAlert } = useAlert();
  const ar = locale === 'ar';

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  const progress = user.referredCount % REFERRAL.goal;
  const ratio = progress / REFERRAL.goal;

  const handleLogout = () => {
    showAlert(
      ar ? 'تسجيل الخروج؟' : 'Sign out?',
      ar ? 'يمكنك تسجيل الدخول مرة أخرى في أي وقت.' : 'You can sign back in any time.',
      [
        { text: ar ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: ar ? 'تسجيل الخروج' : 'Sign out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const simulateReferral = async () => {
    await applyReferral();
    showAlert(
      ar ? 'انضم صديق!' : 'Friend joined!',
      ar ? 'شكراً لنشر الكلمة — استمر!' : 'Thanks for spreading the word — keep going!'
    );
  };

  const handleDriverToggle = async (v: boolean) => {
    await setDriverMode(v);
    if (v) router.replace('/driver');
  };

  return (
    <Screen>
      <Header title={ar ? 'الحساب' : 'Profile'} showBack={false} />
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
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
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

        {/* Language */}
        <Card>
          <View style={styles.langHeader}>
            <View style={styles.langIcon}>
              <MaterialIcons name="translate" size={18} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{t('language')}</Text>
              <Text style={styles.subtle}>
                {ar ? 'العربية / English' : 'English / العربية'}
              </Text>
            </View>
          </View>
          <View style={styles.langRow}>
            <Pressable
              onPress={() => setLocale('en')}
              style={[styles.langBtn, locale === 'en' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, locale === 'en' && styles.langTextActive]}>
                English
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLocale('ar')}
              style={[styles.langBtn, locale === 'ar' && styles.langBtnActive]}
            >
              <Text style={[styles.langText, locale === 'ar' && styles.langTextActive]}>
                العربية
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Driver mode */}
        <View style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.driverIcon}>
              <MaterialIcons name="pedal-bike" size={22} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverTitle}>
                {ar ? 'وضع السائق' : 'Driver mode'}
              </Text>
              <Text style={styles.driverSub}>
                {ar
                  ? `اربح من توصيل الطعام في ${APP.city}.`
                  : `Earn money delivering food across ${APP.city}.`}
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
              <Text style={styles.driverStatLabel}>
                {ar ? 'توصيلات' : 'Deliveries'}
              </Text>
            </View>
            <View style={styles.driverStatDivider} />
            <View style={styles.driverStat}>
              <Text style={styles.driverStatValue}>EGP {stats.totalEarnings}</Text>
              <Text style={styles.driverStatLabel}>{ar ? 'الأرباح' : 'Earned'}</Text>
            </View>
            <View style={styles.driverStatDivider} />
            <Pressable
              onPress={() => router.push('/driver')}
              style={styles.driverOpenBtn}
              hitSlop={6}
            >
              <Text style={styles.driverOpenText}>{ar ? 'فتح' : 'Open'}</Text>
              <MaterialIcons name="chevron-right" size={16} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Referral */}
        <Card>
          <Text style={styles.section}>{ar ? 'ادعُ واربح' : 'Refer & earn'}</Text>
          <Text style={styles.subtle}>
            {ar
              ? `ادعُ ${REFERRAL.goal} أصدقاء واحصل على توصيل مجاني.`
              : `Invite ${REFERRAL.goal} friends and unlock ${REFERRAL.reward}.`}
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>
              {ar ? 'كود الإحالة' : 'Your referral code'}
            </Text>
            <Text style={styles.code}>{user.referralCode}</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {progress} / {REFERRAL.goal}{' '}
            {ar
              ? `إحالات · ${user.freeDeliveries} كوبونات توصيل مجاني`
              : `referrals · ${user.freeDeliveries} free delivery vouchers`}
          </Text>

          <View style={styles.refRow}>
            <Button
              label={ar ? 'مشاركة الكود' : 'Share my code'}
              variant="outline"
              fullWidth={false}
              style={{ flex: 1 }}
              iconLeft={<MaterialIcons name="ios-share" size={16} color={colors.text} />}
              onPress={() =>
                showAlert(
                  ar ? 'مشاركة الكود' : 'Share your code',
                  ar
                    ? `أرسل "${user.referralCode}" لأصدقائك في ${APP.city}.`
                    : `Send "${user.referralCode}" to friends in ${APP.city}.`
                )
              }
            />
            <View style={{ width: spacing.sm }} />
            <Button
              label={ar ? 'محاكاة دعوة' : 'Simulate friend'}
              fullWidth={false}
              style={{ flex: 1 }}
              onPress={simulateReferral}
            />
          </View>
        </Card>

        {/* Geofence simulator */}
        <Card>
          <View style={styles.simRow}>
            <View style={styles.simIcon}>
              <MaterialIcons name="travel-explore" size={18} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{t('simulateOutside')}</Text>
              <Text style={styles.subtle}>{t('simulateOutsideHint')}</Text>
            </View>
            <Switch
              value={user.simulateOutsideZone ?? false}
              onValueChange={(v) => setSimulateOutsideZone(v)}
              trackColor={{ true: colors.primaryDark, false: colors.surfaceMuted }}
              thumbColor={'#fff'}
            />
          </View>
        </Card>

        {/* Settings */}
        <Card padded={false}>
          <Row
            icon="payment"
            label={ar ? 'طرق الدفع' : 'Payment methods'}
            onPress={() =>
              showAlert(
                ar ? 'طرق الدفع' : 'Payment methods',
                ar
                  ? 'الدفع نقداً، فودافون كاش، وانستا باي مدعومة في السادات.'
                  : 'Cash, Vodafone Cash and InstaPay are supported in Al-Sadat.'
              )
            }
          />
          <Row
            icon="location-on"
            label={ar ? 'عناوين التوصيل' : 'Delivery addresses'}
            onPress={() =>
              showAlert(
                ar ? 'العناوين' : 'Addresses',
                ar
                  ? `العنوان الحالي: ${user.area}, ${APP.city}.`
                  : `Currently saved: ${user.area}, ${APP.city}.`
              )
            }
          />
          <Row
            icon="help-outline"
            label={ar ? 'المساعدة والدعم' : 'Help & support'}
            onPress={() =>
              showAlert(
                ar ? 'الدعم' : 'Support',
                ar
                  ? 'تواصل مع فريقنا على support@etlob.app.'
                  : 'Reach our team at support@etlob.app — we reply within an hour.'
              )
            }
          />
          <Row
            icon="info-outline"
            label={ar ? `عن ${APP.nameAr}` : `About ${APP.name}`}
            onPress={() =>
              showAlert(
                `${APP.name} (${APP.nameAr})`,
                ar
                  ? `توصيل طعام بالدراجات في ${APP.city}.`
                  : `Bicycle-powered food delivery for ${APP.city}.`
              )
            }
          />
        </Card>

        <Button
          label={ar ? 'تسجيل الخروج' : 'Sign out'}
          variant="outline"
          onPress={handleLogout}
        />
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
  langHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  langIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnActive: { backgroundColor: colors.primary, ...shadows.soft },
  langText: { ...typography.button, color: colors.textMuted, fontSize: 14 },
  langTextActive: { color: colors.text },
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
  simRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  simIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
