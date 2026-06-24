import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { MenuItem } from '@/constants/mockData';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';

interface Props {
  visible: boolean;
  mainItem: MenuItem | null;
  suggestions: MenuItem[];
  onClose: () => void;
  onConfirm: (selectedAddOnIds: string[]) => void;
}

export function AddOnsSheet({ visible, mainItem, suggestions, onClose, onConfirm }: Props) {
  const { t } = useLocale();
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (visible) setSelected({});
  }, [visible, mainItem?.id]);

  if (!mainItem) return null;

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectedItems = suggestions.filter((s) => selected[s.id]);
  const addOnsTotal = selectedItems.reduce((acc, it) => acc + it.price, 0);
  const total = mainItem.price + addOnsTotal;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('addOnsTitle')}</Text>
              <Text style={styles.sub}>{t('addOnsSub')}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.mainRow}>
              <View style={styles.mainImgWrap}>
                <Image
                  source={{ uri: mainItem.image }}
                  style={styles.mainImg}
                  contentFit="cover"
                  transition={150}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mainName} numberOfLines={1}>{mainItem.nameAr}</Text>
                <Text style={styles.mainSub} numberOfLines={1}>{mainItem.name}</Text>
                <Text style={styles.mainPrice}>{mainItem.price} ج.م</Text>
              </View>
              <View style={styles.mainTag}>
                <MaterialIcons name="check" size={14} color={colors.text} />
              </View>
            </View>

            <Text style={styles.suggestionsLabel}>{t('addOnsSub')}</Text>

            {suggestions.length === 0 ? (
              <View style={styles.empty}>
                <MaterialIcons name="info-outline" size={20} color={colors.textMuted} />
                <Text style={styles.emptyText}>{t('noAddOns')}</Text>
              </View>
            ) : (
              suggestions.map((s) => {
                const isOn = !!selected[s.id];
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => toggle(s.id)}
                    style={({ pressed }) => [
                      styles.addRow,
                      isOn && styles.addRowOn,
                      pressed && { opacity: 0.95 },
                    ]}
                  >
                    <View style={styles.addImgWrap}>
                      <Image
                        source={{ uri: s.image }}
                        style={styles.addImg}
                        contentFit="cover"
                        transition={150}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addName} numberOfLines={1}>{s.nameAr}</Text>
                      <Text style={styles.addDesc} numberOfLines={2}>{s.description}</Text>
                      <Text style={styles.addPrice}>+ {s.price} ج.م</Text>
                    </View>
                    <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                      {isOn ? <MaterialIcons name="check" size={16} color={colors.text} /> : null}
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('total')}</Text>
              <Text style={styles.totalValue}>{total} ج.م</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                label={t('skip')}
                variant="outline"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => onConfirm([])}
              />
              <Button
                label={t('addToCart')}
                fullWidth={false}
                style={{ flex: 1.4 }}
                onPress={() => onConfirm(Object.keys(selected).filter((k) => selected[k]))}
              />
            </View>
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
    maxHeight: '88%',
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
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.lg },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  mainImgWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  mainImg: { width: '100%', height: '100%' },
  mainName: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  mainSub: { ...typography.caption, color: colors.textMuted, marginTop: 1, textAlign: 'right' },
  mainPrice: { ...typography.bodyStrong, color: colors.text, marginTop: 4, textAlign: 'right' },
  mainTag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  suggestionsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
  },
  emptyText: { ...typography.caption, color: colors.textMuted },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  addRowOn: { borderColor: colors.primaryDark, backgroundColor: colors.surfaceAlt },
  addImgWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  addImg: { width: '100%', height: '100%' },
  addName: { ...typography.bodyStrong, color: colors.text, textAlign: 'right' },
  addDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  addPrice: { ...typography.caption, color: colors.text, fontWeight: '700', marginTop: 4, textAlign: 'right' },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...typography.bodyStrong, color: colors.textMuted },
  totalValue: { ...typography.title, color: colors.text },
});
