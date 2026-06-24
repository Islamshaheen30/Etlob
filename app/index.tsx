import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, Button } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useLocale } from '@/hooks/useLocale';
import { APP } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLocale();

  if (loading) return null;
  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Screen edges={['top', 'bottom']} background={colors.background}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="pedal-bike" size={20} color={colors.text} />
          </View>
          <View>
            <Text style={styles.brand}>{APP.nameAr}</Text>
            <Text style={styles.brandAr}>{APP.name}</Text>
          </View>
        </View>

        <View style={styles.heroWrap}>
          <Image
            source={require('@/assets/images/welcome-hero.png')}
            style={styles.hero}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroBadge}>
            <MaterialIcons name="location-on" size={14} color={colors.text} />
            <Text style={styles.heroBadgeText}>{APP.cityAr}</Text>
          </View>
        </View>

        <Text style={styles.title}>{t('welcomeTitle')}</Text>
        <Text style={styles.subtitle}>{t('welcomeSub')}</Text>

        <View style={styles.featureRow}>
          <Feature icon="storefront" label={t('localRestaurants')} />
          <Feature icon="my-location" label={t('liveTracking')} />
          <Feature icon="card-giftcard" label={t('freeDeliveries')} />
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <Button label={t('getStarted')} onPress={() => router.push('/login')} />
          <Button label={t('haveAccount')} variant="ghost" onPress={() => router.push('/login')} />
        </View>

        <Text style={styles.legal}>{t('legalNote')}</Text>
      </ScrollView>
    </Screen>
  );
}

function Feature({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <MaterialIcons name={icon} size={18} color={colors.text} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  brand: { ...typography.title, color: colors.text },
  brandAr: { ...typography.caption, color: colors.textMuted, marginTop: -2 },
  heroWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    ...shadows.pop,
  },
  hero: { width: '100%', aspectRatio: 3 / 4, maxHeight: 360 },
  heroBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    gap: 4,
  },
  heroBadgeText: { ...typography.caption, color: colors.text, fontWeight: '700', marginLeft: 2 },
  title: { ...typography.display, color: colors.text, marginTop: spacing.xl, textAlign: 'right' },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'right' },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  feature: { flex: 1, alignItems: 'center' },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  legal: { ...typography.caption, color: colors.textSubtle, textAlign: 'center', marginTop: spacing.lg },
});
