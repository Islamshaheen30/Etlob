import { MENU_ITEMS, MenuItem, RESTAURANTS, Restaurant } from '@/constants/mockData';

const STATUS_ORDER: Record<string, number> = { open: 0, busy: 1, closed: 2 };

function sortByStatus(list: Restaurant[]): Restaurant[] {
  return [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0));
}

export function getRestaurants(): Restaurant[] {
  return sortByStatus(RESTAURANTS);
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
  if (!q) return sortByStatus(RESTAURANTS);
  const filtered = RESTAURANTS.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.nameAr.includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
  );
  return sortByStatus(filtered);
}

export function listCuisines(): string[] {
  const set = new Set<string>();
  RESTAURANTS.forEach((r) => set.add(r.cuisine));
  return Array.from(set);
}

// Restaurants with active offers — used for the home Offers strip.
// Busy/closed restaurants are still shown so customers know offers exist
// but the card visually communicates the busy state.
export function getRestaurantsWithOffers(): Restaurant[] {
  return RESTAURANTS.filter((r) => !!r.offer);
}

// Suggest add-ons from the same restaurant, excluding items already in cart
// or the main item being added.
export function suggestAddOns(
  restaurantId: string,
  excludeIds: string[] = [],
  max = 4
): MenuItem[] {
  const exclude = new Set(excludeIds);
  return MENU_ITEMS.filter(
    (m) => m.restaurantId === restaurantId && m.isAddon && !exclude.has(m.id)
  ).slice(0, max);
}
