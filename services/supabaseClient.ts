
import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase_types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Realtime subscriptions
export const subscribeToOrders = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
      callback(payload);
    })
    .subscribe();
};

export const subscribeToRestaurants = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:restaurants')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, payload => {
      callback(payload);
    })
    .subscribe();
};

export const subscribeToDrivers = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:drivers')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, payload => {
      callback(payload);
    })
    .subscribe();
};

export const subscribeToMenuItems = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:menu_items')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
      callback(payload);
    })
    .subscribe();
};
