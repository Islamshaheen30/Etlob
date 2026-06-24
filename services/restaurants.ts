// Pure helper functions over restaurant/menu lists.
// All live data is sourced from `contexts/RestaurantsContext` which calls
// Supabase (`restaurants` and `menu_items` tables). These helpers are
// stateless — they operate on whatever list a caller hands them.

import { MenuItem, Restaurant } from '@/constants/mockData';

export function searchInList(list: Restaurant[], query: string): Restaurant[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.nameAr.includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      (r.tags || []).some((t) => t.toLowerCase().includes(q))
  );
}

export function cuisinesFromList(list: Restaurant[]): string[] {
  const set = new Set<string>();
  list.forEach((r) => set.add(r.cuisine));
  return Array.from(set);
}

export function withOffers(list: Restaurant[]): Restaurant[] {
  return list.filter((r) => !!r.offer);
}

// Suggest add-ons from a restaurant's menu, excluding items already in cart
// or the main item being added.
export function suggestAddOnsFromMenu(
  menu: MenuItem[],
  excludeIds: string[] = [],
  max = 4
): MenuItem[] {
  const exclude = new Set(excludeIds);
  return menu.filter((m) => m.isAddon && !exclude.has(m.id)).slice(0, max);
}
