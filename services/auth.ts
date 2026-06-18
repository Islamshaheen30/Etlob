import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  area: string;
  referralCode: string;
  referredCount: number;
  freeDeliveries: number;
  isDriver?: boolean;
  // When true, treats the user as if they were physically outside the
  // delivery zones — useful for QA/testing the geofence flow.
  simulateOutsideZone?: boolean;
  createdAt: number;
}

const KEY = 'etlob.user.v1';

function genCode(name: string) {
  const stem = (name || 'ETLOB').replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'USER';
  const num = Math.floor(100 + Math.random() * 900);
  return `${stem}${num}`;
}

export async function loadUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
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

export function createUser(input: { name: string; phone: string; email?: string; area: string }): UserProfile {
  return {
    id: `u_${Date.now()}`,
    name: input.name.trim() || 'Guest',
    phone: input.phone,
    email: input.email,
    area: input.area,
    referralCode: genCode(input.name),
    referredCount: 0,
    freeDeliveries: 0,
    isDriver: false,
    simulateOutsideZone: false,
    createdAt: Date.now(),
  };
}

export function isInSadatPhone(phone: string): boolean {
  // Simple mock geofence by phone format (Egyptian) - accept if 10-13 digits
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}
