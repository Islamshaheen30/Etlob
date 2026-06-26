import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// تعريف أنواع البيانات
export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  cuisine: string;
  rating: number;
  reviews: number;
  etaMin: number;
  prepTimeMin: number;
  status: 'open' | 'busy' | 'closed';
  deliveryFee: number;
  image: string;
  cover: string;
}

interface RestaurantsContextType {
  restaurants: Restaurant[];
  loading: boolean;
  getRestaurantById: (id: string) => Restaurant | undefined;
}

const RestaurantsContext = createContext<RestaurantsContextType | undefined>(undefined);

export const RestaurantsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة تحويل البيانات من قاعدة البيانات لشكل التطبيق
  const mapRow = (row: any): Restaurant => ({
    id: row.id,
    name: row.name_en || row.name || '',
    nameAr: row.name_ar || row.name || '',
    cuisine: row.cuisine || 'متنوع',
    rating: row.rating || 4.5,
    reviews: row.reviews || 0,
    etaMin: (row.prep_time_min || 20) + 15,
    prepTimeMin: row.prep_time_min || 20,
    status: row.operational_status || 'open',
    deliveryFee: row.delivery_fee || 0,
    image: row.image_url || '',
    cover: row.image_url || '',
  });

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      // جلب المطاعم النشطة فقط
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      if (data) {
        setRestaurants(data.map(mapRow));
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();

    // تفعيل التحديث اللحظي (Real-time)
    const subscription = supabase
      .channel('restaurants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
        fetchRestaurants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getRestaurantById = (id: string) => restaurants.find(r => r.id === id);

  return (
    <RestaurantsContext.Provider value={{ restaurants, loading, getRestaurantById }}>
      {children}
    </RestaurantsContext.Provider>
  );
};

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) throw new Error('useRestaurants must be used within a RestaurantsProvider');
  return context;
};
