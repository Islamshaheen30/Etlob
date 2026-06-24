import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AddressPicker, Button, Card, Header, Pill, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { useAlert } from '@/template';
import { APP } from '@/constants/config';
import { REFERRAL_SETTINGS } from '@/constants/adminSettings';
import { OsmAddressResult } from '@/services/openstreetmap';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function ProfileTab() {
  const router = useRouter();
  const { user, loading, logout, setAddress } = useAuth();
  const { t } = useLocale();
  const { showAlert } = useAlert();
  const [pickerVisible, setPickerVisible] = useState(false);

  if (loading) return null;
  if (!user) return <Redirect href="/" />;

  const goal = REFERRAL_SETTINGS.goal;
  const progress = goal > 0 ? user.referredCount % goal : 0;
  const ratio = goal > 0 ? progress / goal : 0;

  const handleLogout = () => {
    showAlert(t('signOutPrompt'), t('signOutBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleSelectAddress = async (r: OsmAddressResult) => {
    await setAddress({
      address: r.shortName,
      area: r.area,
      addressLocation: r.location,
    });
    showAlert('تم تحديث العنوان', r.displayName);
  };

  return (
    <Screen>
      <Header title={t('profile')} showBack={false} />
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
                <Pill label={APP.cityAr} tone="primary" />
              </View>
            </View>
          </View>
        </Card>

        {/* Address (OpenStreetMap) */}
        <Card>
          <View style={styles.addrHeader}>
            <View style={styles.addrIcon}>
              <MaterialIcons name="location-on" size={18} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.section}>{t('myAddress')}</Text>
              <Text style={styles.subtle}>{t('addressHint')}</Text>
            </View>
          </View>
          {user.address ? (
            <View style={styles.addrBox}>
              <Text style={styles.addrText}>{user.address}</Text>
              {user.addressLocation ? (
                <Text style={styles.addrCoord}>
                  {user.addressLocation.lat.toFixed(4)}, {user.addressLocation.lng.toFixed(4)}
                </Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.addrEmpty}>
              <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
              <Text style={styles.addrEmptyText}>{t('addressEmptyHint')}</Text>
            </View>
          )}
          <Button
            label={user.address ? t('changeAddress') : t('pickAddress')}
            variant="outline"
            iconLeft={<MaterialIcons name="edit-location-alt" size={16} color={colors.text} />}
            onPress={() => setPickerVisible(true)}
          />
        </Card>

        {/* Referral */}
        {REFERRAL_SETTINGS.enabled !== false ? (
          <Card>
            <Text style={styles.section}>{t('referAndEarn')}</Text>
            <Text style={styles.subtle}>
              ادعُ {goal} أصدقاء واحصل على {REFERRAL_SETTINGS.rewardLabelAr}.
            </Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>{t('yourReferralCode')}</Text>
              <Text style={styles.code}>{user.referralCode}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress} / {goal} إحالات · {user.freeDeliveries} {t('freeDeliveriesAvail')}
            </Text>

            <View style={styles.refRow}>
              <Button
                label={t('shareCode')}
                variant="outline"
                iconLeft={<MaterialIcons name="ios-share" size={16} color={colors.text} />}
                onPress={() =>
                  showAlert(
                    t('shareCode'),
                    `أرسل "${user.referralCode}" لأصدقائك في ${APP.cityAr}.`
                  )
                }
              />
            </View>
          </Card>
        ) : null}

        {/* Settings */}
        <Card padded={false}>
          <Row
            icon="payment"
            label={t('paymentMethodsRow')}
            onPress={() =>
              showAlert(
                t('paymentMethodsRow'),
                'الدفع نقداً، فودافون كاش، وإنستا باي مدعومة في السادات.'
              )
            }
          />
          <Row
            icon="location-on"
            label={t('myAddress')}
            onPress={() => setPickerVisible(true)}
          />
          <Row
            icon="help-outline"
            label={t('helpSupport')}
            onPress={() =>
              showAlert(t('helpSupport'), 'تواصل مع فريقنا على support@etlob.app.')
            }
          />
          <Row
            icon="info-outline"
            label={`${t('about')} ${APP.nameAr}`}
            onPress={() =>
              showAlert(`${APP.nameAr} (${APP.name})`, `توصيل طعام بالدراجات في ${APP.cityAr}.`)
            }
          />
        </Card>

        <Button label={t('signOut')} variant="outline" onPress={handleLogout} />
      </ScrollView>

      <AddressPicker
        visible={pickerVisible}
        initialQuery={user.address || APP.cityAr}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectAddress}
      />
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
      <MaterialIcons name="chevron-left" size={22} color={colors.textMuted} />
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
  name: { ...typography.section, color: colors.text, textAlign: 'right' },
  contact: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  section: { ...typography.section, color: colors.text, textAlign: 'right' },
  subtle: { ...typography.caption, color: colors.textMuted, marginTop: 4, textAlign: 'right' },
  addrHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  addrIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    marginBottom: spacing.md,
  },
  addrText: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  addrCoord: { ...typography.micro, color: colors.textMuted, textAlign: 'right' },
  addrEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addrEmptyText: { ...typography.caption, color: colors.textMuted, flex: 1, textAlign: 'right' },
  codeBox: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  codeLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },
  code: { ...typography.title, color: colors.text, letterSpacing: 2, marginTop: 4, textAlign: 'right' },
  progressTrack: {
    marginTop: spacing.md,
    height: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  progressText: { ...typography.caption, color: colors.textMuted, marginTop: 6, textAlign: 'right' },
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
  rowLabel: { ...typography.body, color: colors.text, flex: 1, textAlign: 'right' },
});
