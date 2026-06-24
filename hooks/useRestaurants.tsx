import { useMemo, useState } from 'react';
import { useRestaurantsData } from '@/contexts/RestaurantsContext';
import { Restaurant } from '@/constants/mockData';
import {
  cuisinesFromList,
  searchInList,
  withOffers,
} from '@/services/restaurants';

export function useRestaurants() {
  const { restaurants: all, loading, error, refresh } = useRestaurantsData();
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string>('All');

  const cuisines = useMemo(() => ['All', ...cuisinesFromList(all)], [all]);

  const restaurants: Restaurant[] = useMemo(() => {
    let list = searchInList(all, query);
    if (cuisine !== 'All') list = list.filter((r) => r.cuisine === cuisine);
    return list;
  }, [all, query, cuisine]);

  const offerRestaurants: Restaurant[] = useMemo(() => withOffers(all), [all]);

  return {
    query,
    setQuery,
    cuisine,
    setCuisine,
    cuisines,
    restaurants,
    offerRestaurants,
    loading,
    error,
    refresh,
  };
}
