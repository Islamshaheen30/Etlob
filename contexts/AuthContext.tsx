import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { clearUser, createUser, isInSadatPhone, loadUser, saveUser, UserProfile } from '@/services/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (input: { name: string; phone: string; email?: string; area: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  applyReferral: () => Promise<void>;
  consumeFreeDelivery: () => Promise<void>;
  setDriverMode: (on: boolean) => Promise<void>;
  setSimulateOutsideZone: (on: boolean) => Promise<void>;
  setArea: (area: string) => Promise<void>;
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

  const login = useCallback(async (input: { name: string; phone: string; email?: string; area: string }) => {
    if (!input.name.trim()) return { ok: false, error: 'Please enter your name.' };
    if (!isInSadatPhone(input.phone)) return { ok: false, error: 'Phone number looks invalid.' };
    const u = createUser(input);
    await saveUser(u);
    setUser(u);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await clearUser();
    setUser(null);
  }, []);

  const applyReferral = useCallback(async () => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      referredCount: user.referredCount + 1,
    };
    if (updated.referredCount > 0 && updated.referredCount % 10 === 0) {
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

  const setDriverMode = useCallback(
    async (on: boolean) => {
      if (!user) return;
      const updated: UserProfile = { ...user, isDriver: on };
      await saveUser(updated);
      setUser(updated);
    },
    [user]
  );

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

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      applyReferral,
      consumeFreeDelivery,
      setDriverMode,
      setSimulateOutsideZone,
      setArea,
    }),
    [
      user,
      loading,
      login,
      logout,
      applyReferral,
      consumeFreeDelivery,
      setDriverMode,
      setSimulateOutsideZone,
      setArea,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
