import { MENU_ITEMS, MenuItem, RESTAURANTS, Restaurant } from '@/constants/mockData';

export function getRestaurants(): Restaurant[] {
  return RESTAURANTS;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

export function getMenuByRestaurant(restaurantId: string): MenuItem[] {
  return MENU_ITEMS.filter((m) => m.restaurantId === restaurantId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((m) => m.id === id);
}

export function searchRestaurants(query: string): Restaurant[] {
  const q = query.trim().toLowerCase();
  if (!q) return RESTAURANTS;
  return RESTAURANTS.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function listCuisines(): string[] {
  const set = new Set<string>();
  RESTAURANTS.forEach((r) => set.add(r.cuisine));
  return Array.from(set);
}
