import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/hooks/useLocale';
import { OsmAddressResult, reverseAddress } from '@/services/openstreetmap';
import { LatLng } from '@/services/tracking';
import { SADAT_CENTER } from '@/constants/config';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

interface Props {
  visible: boolean;
  /** Preferred starting pin location; falls back to Al-Sadat city center. */
  initialLocation?: LatLng;
  /** @deprecated kept for back-compat with the search-based picker. */
  initialQuery?: string;
  onClose: () => void;
  onSelect: (result: OsmAddressResult) => void;
}

const DEFAULT_SPAN = 0.06; // degrees of lat/lng either side of `center`
const PIN_HEIGHT = 44;

/**
 * Map-based address picker. The user drops a pin on a stylized map (or uses
 * the device's GPS) and the coordinates are reverse-geocoded via the
 * OpenStreetMap Nominatim API. No manual text search is exposed.
 */
export function AddressPicker({ visible, initialLocation, onClose, onSelect }: Props) {
  const { t } = useLocale();
  const [center, setCenter] = useState<LatLng>(initialLocation || SADAT_CENTER);
  const [pin, setPin] = useState<LatLng>(initialLocation || SADAT_CENTER);
  const [result, setResult] = useState<OsmAddressResult | null>(null);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [layout, setLayout] = useState({ width: 1, height: 1 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolve = useCallback(
    (loc: LatLng) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setResolving(true);
      debounceRef.current = setTimeout(async () => {
        const r = await reverseAddress(loc);
        if (r) {
          setResult({ ...r, location: loc });
        } else {
          setResult({
            id: `${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`,
            displayName: `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`,
            shortName: t('pinnedLocation'),
            area: 'مدينة السادات',
            location: loc,
          });
        }
        setResolving(false);
      }, 400);
    },
    [t]
  );

  useEffect(() => {
    if (!visible) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    const start = initialLocation || SADAT_CENTER;
    setCenter(start);
    setPin(start);
    setResult(null);
    resolve(start);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [visible, initialLocation, resolve]);

  const project = (loc: LatLng) => {
    const minLat = center.lat - DEFAULT_SPAN;
    const maxLat = center.lat + DEFAULT_SPAN;
    const minLng = center.lng - DEFAULT_SPAN;
    const maxLng = center.lng + DEFAULT_SPAN;
    const x = ((loc.lng - minLng) / (maxLng - minLng)) * layout.width;
    const y = (1 - (loc.lat - minLat) / (maxLat - minLat)) * layout.height;
    return { x, y };
  };

  const unproject = (x: number, y: number): LatLng => {
    const minLat = center.lat - DEFAULT_SPAN;
    const maxLat = center.lat + DEFAULT_SPAN;
    const minLng = center.lng - DEFAULT_SPAN;
    const maxLng = center.lng + DEFAULT_SPAN;
    const lng = minLng + (x / layout.width) * (maxLng - minLng);
    const lat = maxLat - (y / layout.height) * (maxLat - minLat);
    return { lat, lng };
  };

  const handleMapPress = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    if (!layout.width || !layout.height) return;
    const next = unproject(locationX, locationY);
    setPin(next);
    resolve(next);
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCenter(loc);
      setPin(loc);
      resolve(loc);
    } catch {
      // ignore — pin stays at current selection
    } finally {
      setLocating(false);
    }
  };

  const confirm = () => {
    if (!result) return;
    onSelect(result);
    onClose();
  };

  const pinPos = project(pin);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{t('pickAddress')}</Text>
              <Text style={styles.sub}>{t('tapMapHint')}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          {/* Interactive map */}
          <View
            style={styles.mapWrap}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setLayout({ width: Math.max(1, width), height: Math.max(1, height) });
            }}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleMapPress}>
              <View style={styles.streets} pointerEvents="none">
                {[...Array(9)].map((_, i) => (
                  <View key={`h${i}`} style={[styles.streetH, { top: `${(i + 1) * 10}%` }]} />
                ))}
                {[...Array(9)].map((_, i) => (
                  <View key={`v${i}`} style={[styles.streetV, { left: `${(i + 1) * 10}%` }]} />
                ))}
              </View>
              <View pointerEvents="none" style={[styles.park, { top: '22%', left: '58%' }]} />
              <View pointerEvents="none" style={[styles.water, { top: '70%', left: '8%' }]} />
              <View pointerEvents="none" style={styles.crosshair}>
                <MaterialIcons name="add" size={14} color="rgba(0,0,0,0.18)" />
              </View>
            </Pressable>

            {/* Pin */}
            <View
              pointerEvents="none"
              style={[
                styles.pinWrap,
                {
                  left: pinPos.x,
                  top: pinPos.y,
                  transform: [{ translateX: -18 }, { translateY: -PIN_HEIGHT }],
                },
              ]}
            >
              <View style={styles.pinCircle}>
                <MaterialIcons name="location-on" size={22} color="#fff" />
              </View>
              <View style={styles.pinTail} />
            </View>

            {/* Use my location FAB */}
            <Pressable onPress={useCurrentLocation} style={styles.fab} hitSlop={6}>
              {locating ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <MaterialIcons name="my-location" size={18} color={colors.text} />
              )}
            </Pressable>

            <View style={styles.locationHint}>
              <MaterialIcons name="touch-app" size={12} color={colors.textMuted} />
              <Text style={styles.locationHintText}>{t('tapMapHint')}</Text>
            </View>

            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>© OpenStreetMap</Text>
            </View>
          </View>

          {/* Use current location row */}
          <Pressable onPress={useCurrentLocation} style={styles.currentRow} disabled={locating}>
            <View style={styles.currentIcon}>
              {locating ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <MaterialIcons name="my-location" size={16} color={colors.text} />
              )}
            </View>
            <Text style={styles.currentText}>{t('useCurrentLocation')}</Text>
            <MaterialIcons name="chevron-left" size={20} color={colors.textMuted} />
          </Pressable>

          {/* Resolved address */}
          <View style={styles.resultBox}>
            <View style={styles.resultIcon}>
              <MaterialIcons name="place" size={18} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultLabel}>{t('selectedLocation')}</Text>
              {resolving ? (
                <View style={styles.resolveRow}>
                  <ActivityIndicator size="small" color={colors.primaryDark} />
                  <Text style={styles.resolving}>{t('resolvingAddress')}</Text>
                </View>
              ) : result ? (
                <>
                  <Text style={styles.resultShort} numberOfLines={1}>
                    {result.shortName}
                  </Text>
                  <Text style={styles.resultLong} numberOfLines={2}>
                    {result.displayName}
                  </Text>
                </>
              ) : (
                <Text style={styles.resolving}>{t('tapMapHint')}</Text>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              label={t('cancel')}
              variant="outline"
              fullWidth={false}
              style={{ flex: 1 }}
              onPress={onClose}
            />
            <View style={{ width: spacing.sm }} />
            <Button
              label={t('confirmLocation')}
              fullWidth={false}
              style={{ flex: 2 }}
              disabled={!result || resolving}
              onPress={confirm}
              iconLeft={<MaterialIcons name="check-circle" size={16} color={colors.text} />}
            />
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
    maxHeight: '94%',
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

  mapWrap: {
    height: 340,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.mapBase,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  streets: { ...StyleSheet.absoluteFillObject },
  streetH: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.mapStreet },
  streetV: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.mapStreet },
  park: {
    position: 'absolute',
    width: '24%',
    height: '20%',
    backgroundColor: colors.mapPark,
    borderRadius: 8,
  },
  water: {
    position: 'absolute',
    width: '22%',
    height: '14%',
    backgroundColor: colors.mapWater,
    borderRadius: 8,
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -7,
    marginTop: -7,
  },

  pinWrap: { position: 'absolute', alignItems: 'center' },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...shadows.pop,
  },
  pinTail: { width: 4, height: 8, backgroundColor: colors.danger, marginTop: -2 },

  fab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.pop,
  },
  locationHint: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  locationHintText: { ...typography.micro, color: colors.textMuted, fontWeight: '700' },
  watermark: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  watermarkText: { ...typography.micro, color: colors.textMuted },

  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  currentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: { ...typography.bodyStrong, color: colors.text, flex: 1, textAlign: 'right' },

  resultBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'right',
  },
  resultShort: { ...typography.bodyStrong, color: colors.text, marginTop: 4, textAlign: 'right' },
  resultLong: { ...typography.caption, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
  resolveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  resolving: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
