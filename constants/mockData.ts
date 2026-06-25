// Static seed data for Etlob V1.0 (Cleaned for Production)

import { SADAT_CENTER } from './config';

export type RestaurantStatus = 'open' | 'busy' | 'closed';

export interface RestaurantOffer {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  discountPct: number;
  code?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  cuisine: string;
  rating: number;
  reviews: number;
  etaMin: number;
  prepTimeMin: number;
  status: RestaurantStatus;
  deliveryFee: number;
  image: string;
  cover: string;
  description: string;
  location: { lat: number; lng: number };
  tags: string[];
  offer?: RestaurantOffer;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  isAddon?: boolean;
}

export const RESTAURANTS: Restaurant[] = [];
export const MENU_ITEMS: MenuItem[] = [];

export const SADAT_AREAS = [
  'District 1', 'District 2', 'District 3', 'District 5', 'District 7', 'District 9', 'Central Market', 'University Area', 'Outside Sadat',
];
