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
import { Button, Header, Input, Screen } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { SADAT_AREAS } from '@/constants/mockData';
import { APP } from '@/constants/config';
import { colors, radius, spacing, typography } from '@/constants/theme';

type Mode = 'phone' | 'email';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<Mode>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState(SADAT_AREAS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const submit = async () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Please enter your full name';
    if (mode === 'phone' && phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a valid phone number';
    if (mode === 'email' && !email.includes('@')) next.email = 'Enter a valid email';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const fakePhone = mode === 'email' ? `010${Date.now().toString().slice(-8)}` : phone;
    const result = await login({ name, phone: fakePhone, email: mode === 'email' ? email : undefined, area });
    setSubmitting(false);

    if (!result.ok) {
      showAlert('Could not sign in', result.error);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <Screen edges={['top']}>
      <Header title="Welcome back" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Sign in to {APP.name}</Text>
          <Text style={styles.subtitle}>
            Quick sign in for {APP.city} residents. No password needed for the demo.
          </Text>

          <View style={styles.modeRow}>
            <ModeChip label="Phone" active={mode === 'phone'} onPress={() => setMode('phone')} />
            <ModeChip label="Email" active={mode === 'email'} onPress={() => setMode('email')} />
          </View>

          <Input
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="Mohamed Ali"
            error={errors.name}
            iconLeft={<MaterialIcons name="person" size={18} color={colors.textMuted} />}
          />

          {mode === 'phone' ? (
            <Input
              label="Mobile number"
              value={phone}
              onChangeText={setPhone}
              placeholder="010 1234 5678"
              keyboardType="phone-pad"
              error={errors.phone}
              iconLeft={<MaterialIcons name="phone-iphone" size={18} color={colors.textMuted} />}
            />
          ) : (
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              iconLeft={<MaterialIcons name="alternate-email" size={18} color={colors.textMuted} />}
            />
          )}

          <Text style={styles.label}>Your area in {APP.city}</Text>
          <View style={styles.areaWrap}>
            {SADAT_AREAS.map((a) => {
              const active = area === a;
              return (
                <Pressable
                  key={a}
                  onPress={() => setArea(a)}
                  style={[styles.area, active && styles.areaActive]}
                >
                  <Text style={[styles.areaText, active && styles.areaTextActive]}>{a}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.geoBox}>
            <MaterialIcons name="location-on" size={16} color={colors.success} />
            <Text style={styles.geoText}>Service area verified: {APP.city}</Text>
          </View>

          <Button label="Continue" loading={submitting} onPress={submit} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
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
  label: { ...typography.caption, color: colors.textMuted, marginBottom: 6, marginLeft: 4 },
  areaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  area: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  areaActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  areaText: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  areaTextActive: { color: colors.text, fontWeight: '700' },
  geoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  geoText: { ...typography.caption, color: colors.success, fontWeight: '700' },
});
