// Admin data access layer for the customer app.
// Treats restaurant catalogue, menu items, and promotional content as
// administered remotely. Today it reads from local seed data
// (`constants/mockData.ts`); swap the implementation here when wiring to a
// backend (OnSpace Cloud, REST API, etc.) without touching the screens.

import { MENU_ITEMS, MenuItem, RESTAURANTS, Restaurant } from '@/constants/mockData';

// Restaurants ordered by status: open > busy > closed.
const STATUS_ORDER: Record<string, number> = { open: 0, busy: 1, closed: 2 };

function sortByStatus(list: Restaurant[]): Restaurant[] {
  return [...list].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
  );
}

export function fetchAdminRestaurants(): Restaurant[] {
  // Admin source — replace with API call when backend is ready.
  return sortByStatus(RESTAURANTS);
}

export function fetchAdminRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

export function fetchAdminMenuByRestaurant(restaurantId: string): MenuItem[] {
  return MENU_ITEMS.filter((m) => m.restaurantId === restaurantId);
}

export function fetchAdminMenuItem(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((m) => m.id === id);
}

export function fetchAdminCuisines(): string[] {
  const set = new Set<string>();
  RESTAURANTS.forEach((r) => set.add(r.cuisine));
  return Array.from(set);
}

export function fetchAdminRestaurantsWithOffers(): Restaurant[] {
  return RESTAURANTS.filter((r) => !!r.offer);
}

export function fetchAdminAreas(): string[] {
  // Admin-managed list of city districts (used as fallback when OSM is
  // unavailable). Mirrors the legacy SADAT_AREAS list.
  return [
    'الحي الأول',
    'الحي الثاني',
    'الحي الثالث',
    'الحي الخامس',
    'الحي السابع',
    'الحي التاسع',
    'السوق المركزي',
    'منطقة الجامعة',
    'خارج السادات',
  ];
}
