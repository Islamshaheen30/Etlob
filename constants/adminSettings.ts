// Admin-managed settings for Etlob
// In production these are pushed from the EtlobAdmin panel; locally they
// act as the single source of truth for warning copy, banners, referral
// configuration, geofence circles, and tunable timing/pricing factors.

import { LatLng } from '@/services/tracking';
import { SADAT_CENTER } from './config';

// ============================================================
// Single-restaurant cart warning (Arabic-only customer app)
// ============================================================
export const SINGLE_RESTAURANT_WARNING = {
  title: 'مطعم واحد لكل طلب',
  body:
    'يمكنك الطلب من مطعم واحد فقط في كل طلبية. فضلاً قم بإفراغ السلة الحالية لبدء طلب جديد من هذا المطعم.',
  confirm: 'إفراغ السلة والمتابعة',
  cancel: 'الإبقاء على السلة',
};

// Out-of-area message
export const OUT_OF_AREA = {
  title: 'الخدمة غير متاحة في منطقتك',
  body:
    'موقعك الحالي خارج نطاق التوصيل. تقدم خدمة اطلب التوصيل داخل مناطق مدينة السادات فقط.',
  cta: 'تحديث العنوان',
};

// ============================================================
// Delivery geofence circles (admin-drawn)
// ============================================================
export interface DeliveryCircle {
  id: string;
  nameAr: string;
  center: LatLng;
  radiusKm: number;
  active: boolean;
}

export const DELIVERY_CIRCLES: DeliveryCircle[] = [
  {
    id: 'c1',
    nameAr: 'وسط السادات',
    center: SADAT_CENTER,
    radiusKm: 6,
    active: true,
  },
  {
    id: 'c2',
    nameAr: 'الأحياء الشمالية',
    center: { lat: SADAT_CENTER.lat + 0.025, lng: SADAT_CENTER.lng + 0.005 },
    radiusKm: 4,
    active: true,
  },
  {
    id: 'c3',
    nameAr: 'منطقة الجامعة',
    center: { lat: SADAT_CENTER.lat - 0.018, lng: SADAT_CENTER.lng + 0.012 },
    radiusKm: 3,
    active: true,
  },
];

// ============================================================
// Pricing tunables
// ============================================================
// Bicycle delivery speed for ETA calculations (kilometres per hour).
export const BIKE_SPEED_KMH = 18;
// Minimum ride padding (mins) so very short trips still feel realistic.
export const MIN_RIDE_MIN = 4;

// ============================================================
// Delivery vehicles
// ============================================================
export type VehicleType = 'bicycle' | 'motorcycle' | 'scooter';

export interface VehicleRate {
  id: VehicleType;
  nameAr: string;
  descAr: string;
  icon: string; // MaterialIcons glyph name
  mode: 'flat' | 'per_km';
  flatFee?: number;
  baseFee?: number;
  perKmFee?: number;
  minFee?: number;
  speedKmh: number;
  active: boolean;
}

export const VEHICLE_RATES: VehicleRate[] = [
  {
    id: 'bicycle',
    nameAr: 'دراجة',
    descAr: 'صديقة للبيئة · مثالية للمسافات القصيرة',
    icon: 'pedal-bike',
    mode: 'per_km',
    baseFee: 5,
    perKmFee: 4,
    minFee: 8,
    speedKmh: 18,
    active: true,
  },
  {
    id: 'motorcycle',
    nameAr: 'دراجة نارية',
    descAr: 'الأسرع · سعر ثابت داخل المدينة',
    icon: 'two-wheeler',
    mode: 'flat',
    flatFee: 35,
    speedKmh: 38,
    active: true,
  },
  {
    id: 'scooter',
    nameAr: 'سكوتر',
    descAr: 'متوازن · سرعة وسعر متوسطان',
    icon: 'electric-scooter',
    mode: 'per_km',
    baseFee: 8,
    perKmFee: 5,
    minFee: 14,
    speedKmh: 28,
    active: true,
  },
];

export function getVehicleRate(id: VehicleType): VehicleRate {
  return VEHICLE_RATES.find((v) => v.id === id) || VEHICLE_RATES[0];
}

// ============================================================
// Advertising banner (admin-managed, auto-scrolling)
// ============================================================
// In production the admin uploads images and sets order/active flags.
// The customer home screen auto-rotates through `active` banners.
export interface AdBannerItem {
  id: string;
  imageUrl: string;
  titleAr?: string;
  subtitleAr?: string;
  // Optional in-app navigation target. When set to a restaurant id the
  // banner becomes a tappable shortcut to that restaurant.
  restaurantId?: string;
  active: boolean;
  order: number;
}

export const AD_BANNERS: AdBannerItem[] = [
  {
    id: 'ad1',
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
    titleAr: 'أهلاً بك في اطلب',
    subtitleAr: 'استمتع بأشهى الأطعمة في السادات',
    active: true,
    order: 1,
  },
  {
    id: 'ad2',
    imageUrl:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1400&q=80',
    titleAr: 'وفّر 20% على أول طلب',
    subtitleAr: 'استخدم الكود WELCOME20 عند الدفع',
    active: true,
    order: 2,
  },
  {
    id: 'ad3',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80',
    titleAr: 'بيتزا ساخنة في 30 دقيقة',
    subtitleAr: 'تابع سائقك مباشرة على الخريطة',
    restaurantId: 'r2',
    active: true,
    order: 3,
  },
  {
    id: 'ad4',
    imageUrl:
      'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=1400&q=80',
    titleAr: 'بطاطس مجانية مع الشاورما',
    subtitleAr: 'العرض ساري لفترة محدودة',
    restaurantId: 'r4',
    active: true,
    order: 4,
  },
];

// Auto-scroll interval in milliseconds (admin-tunable).
export const AD_BANNER_INTERVAL_MS = 4000;

export function getActiveAdBanners(): AdBannerItem[] {
  return AD_BANNERS.filter((b) => b.active).sort((a, b) => a.order - b.order);
}

// ============================================================
// Referral program (admin-managed)
// ============================================================
export interface ReferralSettings {
  goal: number; // friends required to unlock a reward
  rewardLabelAr: string;
  codePrefix: string; // prefix prepended to generated user codes
  codeLength: number; // number of digits to append
  enabled: boolean;
}

export const REFERRAL_SETTINGS: ReferralSettings = {
  goal: 10,
  rewardLabelAr: 'توصيل مجاني',
  codePrefix: 'ETL',
  codeLength: 4,
};

export function generateReferralCode(name: string = ''): string {
  const cfg = REFERRAL_SETTINGS;
  const stem = (name || cfg.codePrefix)
    .replace(/[^a-zA-Zا-ي]/g, '')
    .slice(0, 3)
    .toUpperCase();
  const min = Math.pow(10, cfg.codeLength - 1);
  const max = Math.pow(10, cfg.codeLength) - 1;
  const num = Math.floor(min + Math.random() * (max - min));
  return `${cfg.codePrefix}${stem || ''}${num}`;
}

// ============================================================
// OpenStreetMap / Nominatim API (admin-managed endpoint)
// ============================================================
// Standard Nominatim public API. In production an admin can point this
// to a self-hosted Nominatim instance or a commercial provider.
export const OSM_API = {
  baseUrl: 'https://nominatim.openstreetmap.org',
  searchPath: '/search',
  reversePath: '/reverse',
  userAgent: 'EtlobApp/1.0 (contact@etlob.app)',
  language: 'ar,en',
  countryCode: 'eg',
  searchLimit: 6,
};
