import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DriverOrder, generateMockDriverOrder } from '@/services/driver';
import { stepRider } from '@/services/tracking';
import { VehicleType } from '@/constants/adminSettings';

interface DriverStats {
  totalDeliveries: number;
  totalEarnings: number;
  todayDeliveries: number;
  todayEarnings: number;
}

interface DriverContextType {
  isOnline: boolean;
  setOnline: (v: boolean) => void;
  vehicleType: VehicleType;
  setVehicleType: (v: VehicleType) => void;
  available: DriverOrder[];
  active: DriverOrder | null;
  history: DriverOrder[];
  stats: DriverStats;
  loading: boolean;
  refreshQueue: () => void;
  acceptOrder: (id: string) => boolean;
  declineOrder: (id: string) => void;
  arriveAtRestaurant: () => void;
  pickUp: () => void;
  markDelivered: () => void;
  cancelActive: () => void;
}

export const DriverContext = createContext<DriverContextType | undefined>(undefined);

const ONLINE_KEY = 'etlob.driver.online.v1';
const HISTORY_KEY = 'etlob.driver.history.v1';
const QUEUE_KEY = 'etlob.driver.queue.v1';
const ACTIVE_KEY = 'etlob.driver.active.v1';
const VEHICLE_KEY = 'etlob.driver.vehicle.v1';

export function DriverProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(false);
  const [vehicleType, setVehicleTypeState] = useState<VehicleType>('bicycle');
  const [available, setAvailable] = useState<DriverOrder[]>([]);
  const [active, setActive] = useState<DriverOrder | null>(null);
  const [history, setHistory] = useState<DriverOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queueGenRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate from storage
  useEffect(() => {
    (async () => {
      try {
        const [onl, h, q, a, v] = await Promise.all([
          AsyncStorage.getItem(ONLINE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(QUEUE_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
          AsyncStorage.getItem(VEHICLE_KEY),
        ]);
        if (onl === '1') setIsOnline(true);
        if (h) setHistory(JSON.parse(h));
        if (q) setAvailable(JSON.parse(q));
        if (a && a !== 'null') setActive(JSON.parse(a));
        if (v === 'bicycle' || v === 'motorcycle' || v === 'scooter') {
          setVehicleTypeState(v);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(ONLINE_KEY, isOnline ? '1' : '0');
  }, [isOnline, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(VEHICLE_KEY, vehicleType);
  }, [vehicleType, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(available));
  }, [available, loading]);
  useEffect(() => {
    if (!loading) AsyncStorage.setItem(ACTIVE_KEY, active ? JSON.stringify(active) : 'null');
  }, [active, loading]);

  // Generate mock orders when online. Re-seeds when the rider switches
  // vehicle so they immediately see matching pickups.
  useEffect(() => {
    if (queueGenRef.current) clearInterval(queueGenRef.current);
    if (!isOnline) return;

    setAvailable((prev) => {
      const matching = prev.filter((o) => o.vehicleType === vehicleType).length;
      const need = Math.max(0, 3 - matching);
      if (prev.length === 0) {
        return [
          generateMockDriverOrder(vehicleType),
          generateMockDriverOrder(vehicleType),
          generateMockDriverOrder(),
          generateMockDriverOrder(),
          generateMockDriverOrder(),
        ];
      }
      if (need > 0) {
        const additions = Array.from({ length: need }, () =>
          generateMockDriverOrder(vehicleType)
        );
        return [...additions, ...prev].slice(0, 8);
      }
      return prev;
    });

    queueGenRef.current = setInterval(() => {
      setAvailable((prev) => {
        if (prev.length >= 8) return prev;
        const force = Math.random() < 0.6 ? vehicleType : undefined;
        return [generateMockDriverOrder(force), ...prev];
      });
    }, 22000);

    return () => {
      if (queueGenRef.current) clearInterval(queueGenRef.current);
    };
  }, [isOnline, vehicleType]);

  // Auto-progress rider position when active order
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!active || active.stage === 'delivered' || active.stage === 'cancelled') return;

    tickRef.current = setInterval(() => {
      setActive((prev) => {
        if (!prev || !prev.riderPosition) return prev;
        if (prev.stage === 'at_restaurant') return prev;
        const target =
          prev.stage === 'going_to_customer' ? prev.customerPosition : prev.restaurantPosition;
        return {
          ...prev,
          riderPosition: stepRider(prev.riderPosition, target, 0.18),
        };
      });
    }, 4000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [active?.id, active?.stage]);

  const stats: DriverStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const delivered = history.filter((h) => h.stage === 'delivered');
    const todayList = delivered.filter((h) => (h.deliveredAt ?? 0) >= todayMs);
    return {
      totalDeliveries: delivered.length,
      totalEarnings: delivered.reduce((s, h) => s + h.earnings, 0),
      todayDeliveries: todayList.length,
      todayEarnings: todayList.reduce((s, h) => s + h.earnings, 0),
    };
  }, [history]);

  const setOnline = useCallback((v: boolean) => {
    setIsOnline(v);
    if (!v) setAvailable([]);
  }, []);

  const refreshQueue = useCallback(() => {
    if (!isOnline) return;
    setAvailable((prev) =>
      [
        generateMockDriverOrder(vehicleType),
        generateMockDriverOrder(vehicleType),
        generateMockDriverOrder(),
        ...prev,
      ].slice(0, 8)
    );
  }, [isOnline, vehicleType]);

  const acceptOrder = useCallback(
    (id: string) => {
      if (active) return false;
      let ok = false;
      setAvailable((prev) => {
        const found = prev.find((o) => o.id === id);
        if (!found) return prev;
        ok = true;
        const accepted: DriverOrder = {
          ...found,
          stage: 'going_to_restaurant',
          acceptedAt: Date.now(),
          riderPosition: {
            lat: found.restaurantPosition.lat - 0.012,
            lng: found.restaurantPosition.lng + 0.008,
          },
        };
        setActive(accepted);
        return prev.filter((o) => o.id !== id);
      });
      return ok;
    },
    [active]
  );

  const declineOrder = useCallback((id: string) => {
    setAvailable((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const arriveAtRestaurant = useCallback(() => {
    setActive((prev) =>
      prev
        ? { ...prev, stage: 'at_restaurant', riderPosition: prev.restaurantPosition }
        : prev
    );
  }, []);

  const pickUp = useCallback(() => {
    setActive((prev) =>
      prev ? { ...prev, stage: 'going_to_customer', pickedUpAt: Date.now() } : prev
    );
  }, []);

  const markDelivered = useCallback(() => {
    setActive((prev) => {
      if (!prev) return prev;
      const completed: DriverOrder = {
        ...prev,
        stage: 'delivered',
        deliveredAt: Date.now(),
        riderPosition: prev.customerPosition,
      };
      setHistory((h) => [completed, ...h].slice(0, 50));
      return null;
    });
  }, []);

  const cancelActive = useCallback(() => {
    setActive((prev) => {
      if (!prev) return prev;
      const cancelled: DriverOrder = {
        ...prev,
        stage: 'cancelled',
        deliveredAt: Date.now(),
      };
      setHistory((h) => [cancelled, ...h].slice(0, 50));
      return null;
    });
  }, []);

  const setVehicleType = useCallback((v: VehicleType) => {
    setVehicleTypeState(v);
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      setOnline,
      vehicleType,
      setVehicleType,
      available,
      active,
      history,
      stats,
      loading,
      refreshQueue,
      acceptOrder,
      declineOrder,
      arriveAtRestaurant,
      pickUp,
      markDelivered,
      cancelActive,
    }),
    [
      isOnline,
      setOnline,
      vehicleType,
      setVehicleType,
      available,
      active,
      history,
      stats,
      loading,
      refreshQueue,
      acceptOrder,
      declineOrder,
      arriveAtRestaurant,
      pickUp,
      markDelivered,
      cancelActive,
    ]
  );

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}
