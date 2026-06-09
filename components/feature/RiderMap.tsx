import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { LatLng } from '@/services/tracking';

interface Props {
  rider: LatLng;
  customer: LatLng;
  restaurant: LatLng;
  height?: number;
}

// Convert lat/lng to relative 0..1 coords within bounding box
function project(p: LatLng, min: LatLng, max: LatLng) {
  const x = (p.lng - min.lng) / Math.max(0.0001, max.lng - min.lng);
  const y = 1 - (p.lat - min.lat) / Math.max(0.0001, max.lat - min.lat);
  return { x, y };
}

/**
 * Stylized mock map. Avoids native map dependencies for cross-platform demo.
 * Shows roads, blocks, and three pins (rider/restaurant/customer) with
 * a route line from rider to customer.
 */
export function RiderMap({ rider, customer, restaurant, height = 320 }: Props) {
  const all = [rider, customer, restaurant];
  const lats = all.map((p) => p.lat);
  const lngs = all.map((p) => p.lng);
  const pad = 0.005;
  const min = { lat: Math.min(...lats) - pad, lng: Math.min(...lngs) - pad };
  const max = { lat: Math.max(...lats) + pad, lng: Math.max(...lngs) + pad };

  const r = project(rider, min, max);
  const c = project(customer, min, max);
  const re = project(restaurant, min, max);

  const lineLeft = Math.min(r.x, c.x) * 100;
  const lineTop = Math.min(r.y, c.y) * 100;
  const lineW = Math.abs(c.x - r.x) * 100;
  const lineH = Math.abs(c.y - r.y) * 100;
  const angle = Math.atan2(c.y - r.y, c.x - r.x) * (180 / Math.PI);
  const len = Math.sqrt((c.x - r.x) ** 2 + (c.y - r.y) ** 2) * 100;

  return (
    <View style={[styles.map, { height }]}>
      {/* Map base streets pattern */}
      <View style={styles.streets}>
        {[...Array(7)].map((_, i) => (
          <View key={`h${i}`} style={[styles.streetH, { top: `${(i + 1) * 12.5}%` }]} />
        ))}
        {[...Array(7)].map((_, i) => (
          <View key={`v${i}`} style={[styles.streetV, { left: `${(i + 1) * 12.5}%` }]} />
        ))}
      </View>
      {/* Park block */}
      <View style={[styles.park, { top: '20%', left: '60%' }]} />
      <View style={[styles.water, { top: '70%', left: '5%' }]} />

      {/* Route line: dashed using small pieces */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: `${r.x * 100}%`,
          top: `${r.y * 100}%`,
          width: `${len}%`,
          height: 3,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: '0% 50%',
        }}
      >
        <View style={styles.routeLine} />
      </View>

      {/* Pins */}
      <Pin x={re.x} y={re.y} color={colors.restaurantPin} icon="restaurant" label="Restaurant" />
      <Pin x={c.x} y={c.y} color={colors.customerPin} icon="home" label="You" />
      <Pin x={r.x} y={r.y} color={colors.riderPin} icon="pedal-bike" label="Rider" big />

      {/* Watermark */}
      <View style={styles.watermark}>
        <MaterialIcons name="my-location" size={12} color={colors.textMuted} />
        <Text style={styles.watermarkText}>Live tracking · Al-Sadat</Text>
      </View>
    </View>
  );
}

interface PinProps {
  x: number;
  y: number;
  color: string;
  icon: any;
  label: string;
  big?: boolean;
}

function Pin({ x, y, color, icon, label, big }: PinProps) {
  const size = big ? 38 : 30;
  return (
    <View
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: [{ translateX: -size / 2 }, { translateY: -size }],
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: '#fff',
          ...shadows.pop,
        }}
      >
        <MaterialIcons name={icon} size={big ? 20 : 16} color="#fff" />
      </View>
      <View style={styles.pinLabel}>
        <Text style={styles.pinLabelText}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    backgroundColor: colors.mapBase,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  streets: { ...StyleSheet.absoluteFillObject },
  streetH: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.mapStreet },
  streetV: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.mapStreet },
  park: { position: 'absolute', width: '25%', height: '20%', backgroundColor: colors.mapPark, borderRadius: 8 },
  water: { position: 'absolute', width: '20%', height: '15%', backgroundColor: colors.mapWater, borderRadius: 8 },
  routeLine: {
    flex: 1,
    height: 3,
    backgroundColor: colors.primaryDark,
    borderRadius: 2,
    opacity: 0.8,
  },
  watermark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  watermarkText: { ...typography.micro, color: colors.textMuted, marginLeft: 4 },
  pinLabel: {
    marginTop: 2,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pinLabelText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
