import React, { createContext, ReactNode, useCallback, useMemo, useState } from 'react';
import { MenuItem, Restaurant } from '@/constants/mockData';

export interface CartLine {
  item: MenuItem;
  qty: number;
}

export type AddResult =
  | { ok: true }
  | { ok: false; code: 'different_restaurant'; currentRestaurant: Restaurant };

interface CartContextType {
  restaurant: Restaurant | null;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  add: (restaurant: Restaurant, item: MenuItem, qty?: number) => AddResult;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  clear: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback(
    (r: Restaurant, item: MenuItem, qty = 1): AddResult => {
      if (restaurant && restaurant.id !== r.id) {
        return {
          ok: false,
          code: 'different_restaurant',
          currentRestaurant: restaurant,
        };
      }
      setRestaurant(r);
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.item.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty };
          return next;
        }
        return [...prev, { item, qty }];
      });
      return { ok: true };
    },
    [restaurant]
  );

  const remove = useCallback((itemId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.item.id !== itemId);
      if (next.length === 0) setRestaurant(null);
      return next;
    });
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    if (qty <= 0) {
      remove(itemId);
      return;
    }
    setLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, qty } : l)));
  }, [remove]);

  const clear = useCallback(() => {
    setLines([]);
    setRestaurant(null);
  }, []);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.qty * l.item.price, 0), [lines]);

  const value = useMemo(
    () => ({ restaurant, lines, itemCount, subtotal, add, remove, setQty, clear }),
    [restaurant, lines, itemCount, subtotal, add, remove, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
