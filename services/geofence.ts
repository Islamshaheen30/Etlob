import { DELIVERY_CIRCLES } from '@/constants/adminSettings';
import { SADAT_CENTER } from '@/constants/config';
import { distanceKm, LatLng } from './tracking';

// Best-effort fallback for the legacy area-label addresses. New users go
// through the OpenStreetMap picker which provides real coordinates, but
// older accounts may still only have an area label.
export const AREA_LOCATIONS: Record<string, LatLng> = {
  'District 1': { lat: SADAT_CENTER.lat + 0.005, lng: SADAT_CENTER.lng + 0.003 },
  'District 2': { lat: SADAT_CENTER.lat + 0.012, lng: SADAT_CENTER.lng + 0.008 },
  'District 3': { lat: SADAT_CENTER.lat + 0.018, lng: SADAT_CENTER.lng - 0.002 },
  'District 5': { lat: SADAT_CENTER.lat - 0.005, lng: SADAT_CENTER.lng + 0.012 },
  'District 7': { lat: SADAT_CENTER.lat - 0.014, lng: SADAT_CENTER.lng - 0.008 },
  'District 9': { lat: SADAT_CENTER.lat + 0.022, lng: SADAT_CENTER.lng + 0.014 },
  'Central Market': SADAT_CENTER,
  'University Area': { lat: SADAT_CENTER.lat - 0.018, lng: SADAT_CENTER.lng + 0.012 },
  'Outside Sadat': { lat: SADAT_CENTER.lat + 0.075, lng: SADAT_CENTER.lng + 0.065 },
  // Arabic labels
  'الحي الأول': { lat: SADAT_CENTER.lat + 0.005, lng: SADAT_CENTER.lng + 0.003 },
  'الحي الثاني': { lat: SADAT_CENTER.lat + 0.012, lng: SADAT_CENTER.lng + 0.008 },
  'الحي الثالث': { lat: SADAT_CENTER.lat + 0.018, lng: SADAT_CENTER.lng - 0.002 },
  'الحي الخامس': { lat: SADAT_CENTER.lat - 0.005, lng: SADAT_CENTER.lng + 0.012 },
  'الحي السابع': { lat: SADAT_CENTER.lat - 0.014, lng: SADAT_CENTER.lng - 0.008 },
  'الحي التاسع': { lat: SADAT_CENTER.lat + 0.022, lng: SADAT_CENTER.lng + 0.014 },
  'السوق المركزي': SADAT_CENTER,
  'منطقة الجامعة': { lat: SADAT_CENTER.lat - 0.018, lng: SADAT_CENTER.lng + 0.012 },
  'خارج السادات': { lat: SADAT_CENTER.lat + 0.075, lng: SADAT_CENTER.lng + 0.065 },
};

interface GeoUser {
  area?: string;
  addressLocation?: LatLng;
  simulateOutsideZone?: boolean;
}

export function getEffectiveLocation(user: GeoUser | null | undefined): LatLng {
  if (!user) return SADAT_CENTER;
  if (user.simulateOutsideZone) return AREA_LOCATIONS['Outside Sadat'];
  if (user.addressLocation) return user.addressLocation;
  if (user.area && AREA_LOCATIONS[user.area]) return AREA_LOCATIONS[user.area];
  return SADAT_CENTER;
}

export function isInsideGeofence(loc: LatLng): boolean {
  return DELIVERY_CIRCLES.some(
    (c) => c.active && distanceKm(loc, c.center) <= c.radiusKm
  );
}

export function findEnclosingCircle(loc: LatLng) {
  return DELIVERY_CIRCLES.find(
    (c) => c.active && distanceKm(loc, c.center) <= c.radiusKm
  );
}

export function userIsInDeliveryArea(user: GeoUser | null | undefined): boolean {
  return isInsideGeofence(getEffectiveLocation(user));
}
