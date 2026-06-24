import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateReferralCode } from '@/constants/adminSettings';
import { LatLng } from './tracking';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  // Display label for the user's area (e.g. "District 5" or an OSM result)
  area: string;
  // Full street address (filled via the OpenStreetMap picker)
  address?: string;
  // Coordinates resolved from OSM — preferred over `area` for geofence
  // and distance calculations.
  addressLocation?: LatLng;
  referralCode: string;
  referredCount: number;
  freeDeliveries: number;
  // When true, treats the user as if they were physically outside the
  // delivery zones — useful for QA/testing the geofence flow.
  simulateOutsideZone?: boolean;
  createdAt: number;
}

const KEY = 'etlob.user.v1';

export async function loadUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw) as UserProfile & { isDriver?: boolean };
    // Strip any deprecated driver flag from legacy storage.
    const { isDriver: _legacy, ...clean } = u as any;
    return clean as UserProfile;
  } catch {
    return null;
  }
}

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function createUser(input: {
  name: string;
  phone: string;
  email?: string;
  area: string;
  address?: string;
  addressLocation?: LatLng;
}): UserProfile {
  return {
    id: `u_${Date.now()}`,
    name: input.name.trim() || 'Guest',
    phone: input.phone,
    email: input.email,
    area: input.area,
    address: input.address,
    addressLocation: input.addressLocation,
    referralCode: generateReferralCode(input.name),
    referredCount: 0,
    freeDeliveries: 0,
    simulateOutsideZone: false,
    createdAt: Date.now(),
  };
}

export function isInSadatPhone(phone: string): boolean {
  // Simple mock geofence by phone format (Egyptian) - accept if 10-13 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}
