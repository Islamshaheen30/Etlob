// Driver-side data layer (mock orders queue for delivery riders).
// Each generated order carries a vehicleType so the dashboard can route it
// only to riders operating that vehicle.

import { RESTAURANTS } from '@/constants/mockData';
import { SADAT_CENTER } from '@/constants/config';
import { VehicleType, getVehicleRate } from '@/constants/adminSettings';
import { LatLng } from './tracking';
import { calculateVehicleFee, pickVehicleForDistance } from './vehicles';

export type DriverOrderStage =
  | 'available'
  | 'going_to_restaurant'
  | 'at_restaurant'
  | 'going_to_customer'
  | 'delivered'
  | 'cancelled';

export const DRIVER_STAGE_LABELS: Record<DriverOrderStage, string> = {
  available: 'Available',
  going_to_restaurant: 'Heading to restaurant',
  at_restaurant: 'At restaurant',
  going_to_customer: 'Heading to customer',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export interface DriverOrder {
  id: string;
  restaurant: { id: string; name: string; image: string; nameAr: string };
  customer: { name: string; phone: string; address: string; area: string };
  items: { id: string; name: string; qty: number }[];
  paymentMethod: 'cash' | 'vodafone' | 'instapay';
  total: number;
  earnings: number; // rider commission
  distanceKm: number;
  estimatedMinutes: number;
  stage: DriverOrderStage;
  createdAt: number;
  acceptedAt?: number;
  pickedUpAt?: number;
  deliveredAt?: number;
  riderPosition?: LatLng;
  restaurantPosition: LatLng;
  customerPosition: LatLng;
  notes?: string;
  // Vehicle the customer requested. Riders only see matching orders.
  vehicleType: VehicleType;
}

const NAMES = [
  'Mariam Saleh',
  'Youssef Ali',
  'Nour Hassan',
  'Mostafa Ibrahim',
  'Salma Adel',
  'Khaled Tarek',
  'Hana Mahmoud',
  'Omar Fathy',
  'Laila Magdy',
  'Hossam Said',
];
const ADDRESSES = [
  'Block 12, Flat 5',
  'Villa 32, Block 7',
  'Apartment 8B, Tower 3',
  'House 45, Street 10',
  'Floor 4, Building 22',
  'Block 5, Apt 18',
];
const NOTES: (string | undefined)[] = [
  'Call when you arrive',
  'Leave at the door',
  'Apartment intercom not working',
  'Use the side entrance',
  undefined,
  undefined,
];
const ITEMS_POOL = [
  'Classic Koshary',
  'Margherita Pizza',
  'Cheeseburger',
  'Chicken Shawarma',
  'Iced Latte',
  'Mango Smoothie',
  'Kunafa Plate',
  'Beef Shawarma',
  'Crispy Fries',
  'Foul Medames',
];
const AREAS = [
  'District 1',
  'District 3',
  'District 5',
  'District 7',
  'District 9',
  'University Area',
  'Central Market',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Optional `forcedVehicle` lets the queue lean toward a particular vehicle
// (used when a rider goes online so they immediately see matching jobs).
export function generateMockDriverOrder(forcedVehicle?: VehicleType): DriverOrder {
  const restaurant = pick(RESTAURANTS);
  const itemCount = 1 + Math.floor(Math.random() * 3);
  const items = Array.from({ length: itemCount }).map((_, idx) => ({
    id: `i${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
    name: pick(ITEMS_POOL),
    qty: 1 + Math.floor(Math.random() * 2),
  }));
  const total = 60 + Math.floor(Math.random() * 220);

  // Random customer position around Sadat center
  const angle = Math.random() * Math.PI * 2;
  const radial = 0.005 + Math.random() * 0.014;
  const customerPosition: LatLng = {
    lat: SADAT_CENTER.lat + Math.cos(angle) * radial,
    lng: SADAT_CENTER.lng + Math.sin(angle) * radial,
  };
  const distance = 0.6 + Math.random() * 4.2;

  const vehicleType: VehicleType =
    forcedVehicle ?? pickVehicleForDistance(distance);
  const baseFee = calculateVehicleFee(getVehicleRate(vehicleType), distance);
  const tip = Math.random() > 0.7 ? Math.floor(Math.random() * 6) : 0;
  const earnings = baseFee + tip;
  const rate = getVehicleRate(vehicleType);
  const rideMin = Math.max(
    4,
    Math.ceil((distance / Math.max(1, rate.speedKmh)) * 60)
  );

  return {
    id: `dord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      image: restaurant.image,
      nameAr: restaurant.nameAr,
    },
    customer: {
      name: pick(NAMES),
      phone: `+20 10${Math.floor(10000000 + Math.random() * 89999999)}`,
      address: pick(ADDRESSES),
      area: pick(AREAS),
    },
    items,
    paymentMethod: Math.random() > 0.55 ? 'cash' : 'vodafone',
    total,
    earnings,
    distanceKm: Number(distance.toFixed(2)),
    estimatedMinutes: rideMin + 6 + Math.floor(Math.random() * 6),
    stage: 'available',
    createdAt: Date.now(),
    restaurantPosition: restaurant.location,
    customerPosition,
    notes: pick(NOTES),
    vehicleType,
  };
}
