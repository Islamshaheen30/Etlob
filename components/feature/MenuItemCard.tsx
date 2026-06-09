import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { MenuItem } from '@/constants/mockData';

interface Props {
  item: MenuItem;
  onAdd?: () => void;
  qty?: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export function MenuItemCard({ item, onAdd, qty = 0, onIncrement, onDecrement }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <View style={styles.titleLine}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.popular ? (
            <View style={styles.popular}>
              <MaterialIcons name="local-fire-department" size={12} color="#A06400" />
              <Text style={styles.popularText}>Popular</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.nameAr}>{item.nameAr}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>EGP {item.price}</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.imgWrap}>
          <Image source={{ uri: item.image }} style={styles.img} contentFit="cover" transition={150} />
        </View>
        {qty > 0 ? (
          <View style={styles.stepper}>
            <Pressable onPress={onDecrement} style={styles.stepBtn} hitSlop={6}>
              <MaterialIcons name="remove" size={16} color={colors.text} />
            </Pressable>
            <Text style={styles.qty}>{qty}</Text>
            <Pressable onPress={onIncrement} style={styles.stepBtn} hitSlop={6}>
              <MaterialIcons name="add" size={16} color={colors.text} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onAdd}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          >
            <MaterialIcons name="add" size={18} color={colors.text} />
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { ...typography.bodyStrong, color: colors.text },
  nameAr: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  desc: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  price: { ...typography.bodyStrong, color: colors.text, marginTop: 8 },
  popular: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  popularText: { fontSize: 10, color: '#A06400', fontWeight: '700' },
  imgWrap: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    ...shadows.soft,
  },
  img: { width: '100%', height: '100%' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    marginTop: -16,
    gap: 4,
    ...shadows.soft,
  },
  addLabel: { ...typography.caption, color: colors.text, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: -16,
    gap: 4,
    ...shadows.soft,
  },
  stepBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  qty: { ...typography.bodyStrong, color: colors.text, minWidth: 20, textAlign: 'center' },
});
