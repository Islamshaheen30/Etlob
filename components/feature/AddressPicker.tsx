import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/hooks/useLocale';
import { OsmAddressResult, searchAddress } from '@/services/openstreetmap';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  visible: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelect: (result: OsmAddressResult) => void;
}

/**
 * OpenStreetMap (Nominatim) address picker. Debounces the user's query and
 * surfaces up to N results biased to Egypt. All copy is Arabic.
 */
export function AddressPicker({ visible, initialQuery = '', onClose, onSelect }: Props) {
  const { t } = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<OsmAddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setQuery(initialQuery);
      setResults([]);
      setTouched(false);
    }
  }, [visible, initialQuery]);

  useEffect(() => {
    if (!visible) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setTouched(true);
    debounceRef.current = setTimeout(async () => {
      const hits = await searchAddress(query);
      setResults(hits);
      setLoading(false);
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, visible]);

  const emptyState = useMemo(() => {
    if (loading) return null;
    if (!touched) {
      return (
        <View style={styles.empty}>
          <MaterialIcons name="search" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t('addressHint')}</Text>
        </View>
      );
    }
    if (results.length === 0) {
      return (
        <View style={styles.empty}>
          <MaterialIcons name="search-off" size={28} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t('noAddressResults')}</Text>
        </View>
      );
    }
    return null;
  }, [loading, touched, results.length, t]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('pickAddress')}</Text>
              <Text style={styles.sub}>{t('addressHint')}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('searchAddress')}
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
              autoFocus
              textAlign="right"
            />
            {loading ? (
              <ActivityIndicator color={colors.primaryDark} />
            ) : query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <MaterialIcons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {emptyState ? (
            emptyState
          ) : (
            <FlatList
              data={results}
              keyExtractor={(r) => r.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.list}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={({ pressed }) => [styles.result, pressed && styles.resultPressed]}
                >
                  <View style={styles.pinWrap}>
                    <MaterialIcons name="location-on" size={18} color={colors.primaryDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shortName} numberOfLines={1}>
                      {item.shortName}
                    </Text>
                    <Text style={styles.displayName} numberOfLines={2}>
                      {item.displayName}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                    style={styles.selectBtn}
                  >
                    <Text style={styles.selectText}>{t('selectAddress')}</Text>
                  </Pressable>
                </Pressable>
              )}
            />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerNote}>© OpenStreetMap contributors</Text>
            <Button label={t('cancel')} variant="outline" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 8,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.section, color: colors.text, textAlign: 'right' },
  sub: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  searchRow: {
    margin: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: 12,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.divider },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  resultPressed: { backgroundColor: colors.surfaceAlt },
  pinWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortName: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  displayName: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  selectBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    ...shadows.soft,
  },
  selectText: { ...typography.caption, color: colors.text, fontWeight: '800' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    minHeight: 220,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  footerNote: { ...typography.micro, color: colors.textSubtle, textAlign: 'center' },
});
