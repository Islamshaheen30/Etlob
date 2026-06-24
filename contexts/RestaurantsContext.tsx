// Restaurants & menu items loaded from Supabase tables.
// Acts as the single source of truth for the app — `useRestaurants` and
// page-level hooks read from this context instead of static seed data.

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSupabaseClient } from '@/template';
import { MenuItem, Restaurant } from '@/constants/mockData';
import { SADAT_CENTER } from '@/constants/config';

interface RestaurantsContextType {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getRestaurantById: (id: string) => Restaurant | undefined;
  getMenuByRestaurant: (id: string) => MenuItem[];
}

const RestaurantsContext = createContext<RestaurantsContextType | undefined>(
  undefined
);

const STATUS_ORDER: Record<string, number> = { open: 0, busy: 1, closed: 2 };

function mapRestaurantRow(row: any): Restaurant {
  const prep = Number(row.prep_time_min) || 20;
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    cuisine: row.cuisine || 'Other',
    rating: Number(row.rating) || 4.5,
    reviews: Number(row.reviews) || 100,
    etaMin: prep + 12,
    prepTimeMin: prep,
    status: (row.status as Restaurant['status']) || 'open',
    deliveryFee: Number(row.delivery_fee) || 0,
    image: row.image_url || '',
    cover: row.image_url || '',
    description: row.description_ar || row.description_en || '',
    location: {
      lat: Number(row.location_lat) || SADAT_CENTER.lat,
      lng: Number(row.location_lng) || SADAT_CENTER.lng,
    },
    tags: Array.isArray(row.tags) ? row.tags : [],
    offer: row.offer_pct
      ? {
          titleEn: row.offer_title_en || `${row.offer_pct}% off`,
          titleAr: row.offer_title_ar || `خصم ${row.offer_pct}%`,
          descEn: row.offer_title_en || '',
          descAr: row.offer_title_ar || '',
          discountPct: Number(row.offer_pct),
        }
      : undefined,
  };
}

function mapMenuItemRow(row: any): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    nameAr: row.name_ar,
    description: row.description_ar || row.description || '',
    price: Number(row.price) || 0,
    image: row.image_url || '',
    category: row.category || 'Main',
    popular: !!row.popular,
    isAddon: !!row.is_addon,
  };
}

export function RestaurantsProvider({ children }: { children: ReactNode }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const [restResp, menuResp] = await Promise.all([
        supabase.from('restaurants').select('*').eq('active', true),
        supabase.from('menu_items').select('*').eq('available', true),
      ]);
      if (restResp.error) throw restResp.error;
      if (menuResp.error) throw menuResp.error;
      const rs = (restResp.data || [])
        .map(mapRestaurantRow)
        .sort(
          (a, b) =>
            (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
        );
      setRestaurants(rs);
      setMenuItems((menuResp.data || []).map(mapMenuItemRow));
    } catch (e: any) {
      setError(e?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getRestaurantById = useCallback(
    (id: string) => restaurants.find((r) => r.id === id),
    [restaurants]
  );

  const getMenuByRestaurant = useCallback(
    (id: string) => menuItems.filter((m) => m.restaurantId === id),
    [menuItems]
  );

  const value = useMemo(
    () => ({
      restaurants,
      menuItems,
      loading,
      error,
      refresh,
      getRestaurantById,
      getMenuByRestaurant,
    }),
    [
      restaurants,
      menuItems,
      loading,
      error,
      refresh,
      getRestaurantById,
      getMenuByRestaurant,
    ]
  );

  return (
    <RestaurantsContext.Provider value={value}>
      {children}
    </RestaurantsContext.Provider>
  );
}

export function useRestaurantsData() {
  const ctx = useContext(RestaurantsContext);
  if (!ctx)
    throw new Error(
      'useRestaurantsData must be used within RestaurantsProvider'
    );
  return ctx;
}
