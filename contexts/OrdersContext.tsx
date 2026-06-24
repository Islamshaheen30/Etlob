// Orders state backed by Supabase, with a Postgres realtime subscription
// for live status updates. The local rider simulator advances status every
// few seconds and pushes it through Supabase so the realtime channel
// demonstrates live tracking.

import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getSupabaseClient } from '@/template';
import {
  fetchOrdersForCustomer,
  mapOrderRow,
  Order,
  OrderStatus,
  orderPatchToRow,
  progressOrderStatus,
  updateOrderInDb,
} from '@/services/orders';
import { stepRider } from '@/services/tracking';
import { useAuth } from '@/hooks/useAuth';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
  getById: (id: string) => Order | undefined;
}

export const OrdersContext = createContext<OrdersContextType | undefined>(
  undefined
);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<any>(null);

  // Load + subscribe whenever the user changes
  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const list = await fetchOrdersForCustomer(user.id);
      if (!cancelled) {
        setOrders(list);
        setLoading(false);
      }
    })();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            const oldId = payload.old?.id;
            if (oldId) {
              setOrders((prev) => prev.filter((p) => p.id !== oldId));
            }
            return;
          }
          const next = mapOrderRow(payload.new);
          setOrders((prev) => {
            const idx = prev.findIndex((p) => p.id === next.id);
            if (idx < 0) return [next, ...prev];
            const copy = [...prev];
            // Preserve locally-advancing rider position when DB has none
            copy[idx] = {
              ...copy[idx],
              ...next,
              riderPosition: next.riderPosition || copy[idx].riderPosition,
            };
            return copy;
          });
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  // Demo: mock rider movement & status progression locally; push status
  // changes to Supabase so realtime fires across clients.
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setOrders((prev) => {
        const pendingPushes: Promise<any>[] = [];
        const next = prev.map((o) => {
          if (
            o.status === 'delivered' ||
            o.status === 'cancelled' ||
            o.status === 'pending_payment' ||
            o.status === 'verifying'
          ) {
            return o;
          }
          let updated: Order = { ...o };
          if (o.riderPosition) {
            const target =
              o.status === 'on_the_way' ? o.customerPosition : o.restaurantPosition;
            updated.riderPosition = stepRider(o.riderPosition, target, 0.18);
          }
          if (Math.random() < 0.35) {
            const newStatus = progressOrderStatus(o.status);
            updated.status = newStatus;
            if (newStatus === 'on_the_way' && o.riderPosition) {
              updated.riderPosition = o.restaurantPosition;
            }
            if (newStatus === 'delivered') {
              updated.riderPosition = o.customerPosition;
            }
            pendingPushes.push(
              updateOrderInDb(o.id, {
                status: newStatus,
                rider_location: updated.riderPosition,
              })
            );
          }
          if (o.estimatedMinutes > 1 && updated.status !== 'delivered') {
            updated.estimatedMinutes = Math.max(1, o.estimatedMinutes - 1);
          }
          return updated;
        });
        // Fire and forget — realtime will reconcile other clients.
        if (pendingPushes.length > 0) Promise.all(pendingPushes).catch(() => {});
        return next;
      });
    }, 6000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    // Optimistically merge into local state; realtime will reconcile.
    setOrders((prev) =>
      prev.find((p) => p.id === order.id) ? prev : [order, ...prev]
    );
  }, []);

  const updateOrder = useCallback(async (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    const row = orderPatchToRow(patch);
    if (Object.keys(row).length > 0) {
      await updateOrderInDb(id, row);
    }
  }, []);

  const setStatus = useCallback(
    async (id: string, status: OrderStatus) => {
      await updateOrder(id, { status });
    },
    [updateOrder]
  );

  const getById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const value = useMemo(
    () => ({ orders, loading, addOrder, updateOrder, setStatus, getById }),
    [orders, loading, addOrder, updateOrder, setStatus, getById]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}
