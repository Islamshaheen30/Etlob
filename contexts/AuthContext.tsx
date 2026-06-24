import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { clearUser, createUser, isInSadatPhone, loadUser, saveUser, UserProfile } from '@/services/auth';
import { REFERRAL_SETTINGS } from '@/constants/adminSettings';
import { LatLng } from '@/services/tracking';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (input: {
    name: string;
    phone: string;
    email?: string;
    area: string;
    address?: string;
    addressLocation?: LatLng;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  applyReferral: () => Promise<void>;
  consumeFreeDelivery: () => Promise<void>;
  setSimulateOutsideZone: (on: boolean) => Promise<void>;
  setArea: (area: string) => Promise<void>;
  setAddress: (params: { address: string; area?: string; addressLocation?: LatLng }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await loadUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const login = useCallback(
    async (input: {
      name: string;
      phone: string;
      email?: string;
      area: string;
      address?: string;
      addressLocation?: LatLng;
    }) => {
      if (!input.name.trim()) return { ok: false, error: 'الرجاء إدخال اسمك.' };
      if (!isInSadatPhone(input.phone)) return { ok: false, error: 'رقم الجوال غير صحيح.' };
      const u = createUser(input);
      await saveUser(u);
      setUser(u);
      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    await clearUser();
    setUser(null);
  }, []);

  const applyReferral = useCallback(async () => {
    if (!user) return;
    const goal = REFERRAL_SETTINGS.goal;
    const updated: UserProfile = {
      ...user,
      referredCount: user.referredCount + 1,
    };
    if (goal > 0 && updated.referredCount > 0 && updated.referredCount % goal === 0) {
      updated.freeDeliveries += 1;
    }
    await saveUser(updated);
    setUser(updated);
  }, [user]);

  const consumeFreeDelivery = useCallback(async () => {
    if (!user || user.freeDeliveries <= 0) return;
    const updated = { ...user, freeDeliveries: user.freeDeliveries - 1 };
    await saveUser(updated);
    setUser(updated);
  }, [user]);

  const setSimulateOutsideZone = useCallback(
    async (on: boolean) => {
      if (!user) return;
      const updated: UserProfile = { ...user, simulateOutsideZone: on };
      await saveUser(updated);
      setUser(updated);
    },
    [user]
  );

  const setArea = useCallback(
    async (area: string) => {
      if (!user) return;
      const updated: UserProfile = { ...user, area };
      await saveUser(updated);
      setUser(updated);
    },
    [user]
  );

  const setAddress = useCallback(
    async (params: { address: string; area?: string; addressLocation?: LatLng }) => {
      if (!user) return;
      const updated: UserProfile = {
        ...user,
        address: params.address,
        addressLocation: params.addressLocation ?? user.addressLocation,
        area: params.area ?? user.area,
      };
      await saveUser(updated);
      setUser(updated);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      applyReferral,
      consumeFreeDelivery,
      setSimulateOutsideZone,
      setArea,
      setAddress,
    }),
    [
      user,
      loading,
      login,
      logout,
      applyReferral,
      consumeFreeDelivery,
      setSimulateOutsideZone,
      setArea,
      setAddress,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
