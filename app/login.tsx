import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AddressPicker, Button, Header, Input, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template/ui';
import { useLocale } from '@/hooks/useLocale';
import { APP } from '@/constants/config';
import { OsmAddressResult } from '@/services/openstreetmap';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Mode = 'phone' | 'email';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useLocale();

  const [mode, setMode] = useState<Mode>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddressText] = useState('');
  const [area, setArea] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; address?: string }>({});

  const submit = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t('invalidName');
    if (mode === 'phone' && phone.replace(/\D/g, '').length < 10) next.phone = t('invalidPhone');
    if (mode === 'email' && !email.includes('@')) next.email = t('invalidEmail');
    if (!address.trim()) next.address = t('addressEmpty');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const fakePhone = mode === 'email' ? `010${Date.now().toString().slice(-8)}` : phone;
    const result = await login({
      name,
      phone: fakePhone,
      email: mode === 'email' ? email : undefined,
      area: area || APP.cityAr,
      address,
      addressLocation: coords,
    });
    setSubmitting(false);

    if (!result.ok) {
      showAlert(t('loginFailed'), result.error);
      return;
    }
    router.replace('/(tabs)');
  };

  const handleSelectAddress = (r: OsmAddressResult) => {
    setAddressText(r.shortName);
    setArea(r.area);
    setCoords(r.location);
    setErrors((e) => ({ ...e, address: undefined }));
  };

  return (
    <Screen edges={['top']}>
      <Header title={t('welcomeBack')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{t('signInAction')} {APP.nameAr}</Text>
          <Text style={styles.subtitle}>{t('signInSub')}</Text>

          <View style={styles.modeRow}>
            <ModeChip label={t('phoneTab')} active={mode === 'phone'} onPress={() => setMode('phone')} />
            <ModeChip label={t('emailTab')} active={mode === 'email'} onPress={() => setMode('email')} />
          </View>

          <Input
            label={t('fullName')}
            value={name}
            onChangeText={setName}
            placeholder="محمد علي"
            error={errors.name}
            iconLeft={<MaterialIcons name="person" size={18} color={colors.textMuted} />}
          />

          {mode === 'phone' ? (
            <Input
              label={t('mobileNumber')}
              value={phone}
              onChangeText={setPhone}
              placeholder="010 1234 5678"
              keyboardType="phone-pad"
              error={errors.phone}
              iconLeft={<MaterialIcons name="phone-iphone" size={18} color={colors.textMuted} />}
            />
          ) : (
            <Input
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              iconLeft={<MaterialIcons name="alternate-email" size={18} color={colors.textMuted} />}
            />
          )}

          <Text style={styles.label}>{t('myAddress')}</Text>
          <Pressable
            onPress={() => setPickerVisible(true)}
            style={[styles.addressTrigger, errors.address && styles.addressError]}
          >
            <MaterialIcons name="location-on" size={18} color={colors.primaryDark} />
            <View style={{ flex: 1 }}>
              {address ? (
                <>
                  <Text style={styles.addressTitle} numberOfLines={1}>{address}</Text>
                  {area ? <Text style={styles.addressSub} numberOfLines={1}>{area}</Text> : null}
                </>
              ) : (
                <Text style={styles.addressPlaceholder}>{t('pickAddress')}</Text>
              )}
            </View>
            <MaterialIcons name="search" size={18} color={colors.textMuted} />
          </Pressable>
          {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

          <View style={styles.geoBox}>
            <MaterialIcons name="location-on" size={16} color={colors.success} />
            <Text style={styles.geoText}>{t('serviceVerified')}: {APP.cityAr}</Text>
          </View>

          <Button label={t('continue')} loading={submitting} onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>

      <AddressPicker
        visible={pickerVisible}
        initialQuery={address || APP.cityAr}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectAddress}
      />
    </Screen>
  );
}

function ModeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeChip, active && styles.modeChipActive]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: colors.text, textAlign: 'right' },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, textAlign: 'right' },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  modeChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  modeChipActive: { backgroundColor: colors.primary },
  modeText: { ...typography.caption, fontWeight: '700', color: colors.textMuted },
  modeTextActive: { color: colors.text },
  label: { ...typography.caption, color: colors.textMuted, marginBottom: 6, marginLeft: 4, textAlign: 'right' },
  addressTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressError: { borderColor: colors.danger },
  addressPlaceholder: { ...typography.body, color: colors.textSubtle, textAlign: 'right' },
  addressTitle: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  addressSub: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  errorText: { ...typography.caption, color: colors.danger, marginTop: 6, textAlign: 'right' },
  geoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  geoText: { ...typography.caption, color: colors.success, fontWeight: '700' },
});
