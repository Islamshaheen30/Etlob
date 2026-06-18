import { useMemo, useState } from 'react';
import { getRestaurantsWithOffers, listCuisines, searchRestaurants } from '@/services/restaurants';
import { Restaurant } from '@/constants/mockData';

export function useRestaurants() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string>('All');

  const cuisines = useMemo(() => ['All', ...listCuisines()], []);

  const restaurants: Restaurant[] = useMemo(() => {
    let list = searchRestaurants(query);
    if (cuisine !== 'All') list = list.filter((r) => r.cuisine === cuisine);
    return list;
  }, [query, cuisine]);

  const offerRestaurants: Restaurant[] = useMemo(() => getRestaurantsWithOffers(), []);

  return {
    query,
    setQuery,
    cuisine,
    setCuisine,
    cuisines,
    restaurants,
    offerRestaurants,
  };
}
