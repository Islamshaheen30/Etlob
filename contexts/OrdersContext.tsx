import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadOrders, Order, OrderStatus, progressOrderStatus, saveOrders } from '@/services/orders';
import { stepRider } from '@/services/tracking';

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  setStatus: (id: string, status: OrderStatus) => Promise<void>;
  getById: (id: string) => Order | undefined;
}

export const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const list = await loadOrders();
      setOrders(list);
      setLoading(false);
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loading) saveOrders(orders);
  }, [orders, loading]);

  // Mock status progression + rider movement every 6s
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.status === 'delivered' || o.status === 'cancelled' || o.status === 'pending_payment') {
            return o;
          }
          let next: Order = { ...o };
          // Move rider toward target
          if (o.riderPosition) {
            const target = o.status === 'on_the_way' ? o.customerPosition : o.restaurantPosition;
            next.riderPosition = stepRider(o.riderPosition, target, 0.18);
          }
          // Advance status occasionally
          if (Math.random() < 0.35) {
            next.status = progressOrderStatus(o.status);
            if (next.status === 'on_the_way' && o.riderPosition) {
              next.riderPosition = o.restaurantPosition;
            }
            if (next.status === 'delivered') {
              next.riderPosition = o.customerPosition;
            }
          }
          // Estimated countdown
          if (o.estimatedMinutes > 1 && next.status !== 'delivered') {
            next.estimatedMinutes = Math.max(1, o.estimatedMinutes - 1);
          }
          return next;
        })
      );
    }, 6000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const addOrder = useCallback(async (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrder = useCallback(async (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const setStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const getById = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  const value = useMemo(
    () => ({ orders, loading, addOrder, updateOrder, setStatus, getById }),
    [orders, loading, addOrder, updateOrder, setStatus, getById]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}
