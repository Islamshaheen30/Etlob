// Admin-managed settings for Etlob
// In a real build these are editable from the EtlobAdmin panel.
// For V1 they are stored locally and serve as the source of truth for
// warning copy, geofence circles, and tunable timing factors.

import { LatLng } from '@/services/tracking';
import { SADAT_CENTER } from './config';

// Bilingual warning shown when a customer tries to add an item from a
// different restaurant while their cart already has items.
export const SINGLE_RESTAURANT_WARNING = {
  en: {
    title: 'One restaurant per order',
    body:
      'Etlob only delivers items from one restaurant at a time. Clear your current cart to start a new order from this restaurant.',
    confirm: 'Clear cart & continue',
    cancel: 'Keep my cart',
  },
  ar: {
    title: 'مطعم واحد لكل طلب',
    body:
      'يمكنك الطلب من مطعم واحد فقط في كل طلبية. فضلاً قم بإفراغ السلة الحالية لبدء طلب جديد من هذا المطعم.',
    confirm: 'إفراغ السلة والمتابعة',
    cancel: 'الإبقاء على السلة',
  },
} as const;

// Out-of-area message
export const OUT_OF_AREA = {
  en: {
    title: 'Service not available in your area',
    body:
      'Your current location is outside our delivery zones. Etlob currently delivers within Al-Sadat City zones only.',
    cta: 'Update my address',
  },
  ar: {
    title: 'الخدمة غير متاحة في منطقتك',
    body:
      'موقعك الحالي خارج نطاق التوصيل. تقدم خدمة اطلب التوصيل داخل مناطق مدينة السادات فقط.',
    cta: 'تحديث العنوان',
  },
} as const;

export interface DeliveryCircle {
  id: string;
  name: string;
  nameAr: string;
  center: LatLng;
  radiusKm: number;
  active: boolean;
}

// Circles drawn by EtlobAdmin to define active delivery zones.
export const DELIVERY_CIRCLES: DeliveryCircle[] = [
  {
    id: 'c1',
    name: 'Central Sadat',
    nameAr: 'وسط السادات',
    center: SADAT_CENTER,
    radiusKm: 6,
    active: true,
  },
  {
    id: 'c2',
    name: 'North Districts',
    nameAr: 'الأحياء الشمالية',
    center: { lat: SADAT_CENTER.lat + 0.025, lng: SADAT_CENTER.lng + 0.005 },
    radiusKm: 4,
    active: true,
  },
  {
    id: 'c3',
    name: 'University Area',
    nameAr: 'منطقة الجامعة',
    center: { lat: SADAT_CENTER.lat - 0.018, lng: SADAT_CENTER.lng + 0.012 },
    radiusKm: 3,
    active: true,
  },
];

// Bicycle delivery speed for ETA calculations (kilometres per hour).
export const BIKE_SPEED_KMH = 18;
// Minimum ride padding (mins) so very short trips still feel realistic.
export const MIN_RIDE_MIN = 4;
