// Restaurant queries — all data sourced through the admin layer.

import { MenuItem, Restaurant } from '@/constants/mockData';
import {
  fetchAdminCuisines,
  fetchAdminMenuByRestaurant,
  fetchAdminMenuItem,
  fetchAdminRestaurantById,
  fetchAdminRestaurants,
  fetchAdminRestaurantsWithOffers,
} from './admin';

export function getRestaurants(): Restaurant[] {
  return fetchAdminRestaurants();
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return fetchAdminRestaurantById(id);
}

export function getMenuByRestaurant(restaurantId: string): MenuItem[] {
  return fetchAdminMenuByRestaurant(restaurantId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return fetchAdminMenuItem(id);
}

export function searchRestaurants(query: string): Restaurant[] {
  const all = fetchAdminRestaurants();
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.nameAr.includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function listCuisines(): string[] {
  return fetchAdminCuisines();
}

// Restaurants with active offers — used for the home Offers strip.
export function getRestaurantsWithOffers(): Restaurant[] {
  return fetchAdminRestaurantsWithOffers();
}

// Suggest add-ons from the same restaurant, excluding items already in
// cart or the main item being added.
export function suggestAddOns(
  restaurantId: string,
  excludeIds: string[] = [],
  max = 4
): MenuItem[] {
  const menu = fetchAdminMenuByRestaurant(restaurantId);
  const exclude = new Set(excludeIds);
  return menu.filter((m) => m.isAddon && !exclude.has(m.id)).slice(0, max);
}
