// Lightweight bilingual strings for Etlob V1.
// New screens use t(key); legacy strings stay English for now.

export type Locale = 'en' | 'ar';

export const STRINGS = {
  hello: { en: 'Hello', ar: 'أهلاً' },
  searchHint: { en: 'Search restaurants or cuisines', ar: 'ابحث عن مطعم أو مطبخ' },
  featured: { en: 'Featured in Al-Sadat', ar: 'الأبرز في السادات' },
  cuisines: { en: 'Browse by cuisine', ar: 'تصفح حسب المطبخ' },
  allRestaurants: { en: 'All restaurants', ar: 'كل المطاعم' },
  specialOffers: { en: 'Special offers', ar: 'عروض خاصة' },
  specialOffersSub: {
    en: 'Save more on selected restaurants',
    ar: 'وفّر أكثر مع مطاعم مختارة',
  },
  busy: { en: 'Busy', ar: 'مزدحم' },
  busyDesc: {
    en: 'Not accepting orders right now',
    ar: 'لا يقبل الطلبات حالياً',
  },
  busyBannerTitle: { en: 'Restaurant is busy', ar: 'المطعم مزدحم حالياً' },
  busyBannerBody: {
    en: 'Ordering is paused. You can browse the menu and come back later.',
    ar: 'تم إيقاف الطلب مؤقتاً. يمكنك تصفح القائمة والعودة لاحقاً.',
  },
  totalTime: { en: 'min total', ar: 'دقيقة إجمالاً' },
  prepLabel: { en: 'prep', ar: 'تحضير' },
  rideLabel: { en: 'ride', ar: 'توصيل' },
  off: { en: 'OFF', ar: 'خصم' },
  viewOffer: { en: 'View offer', ar: 'عرض التفاصيل' },
  yourOffer: { en: 'Your offer', ar: 'عرضك' },
  addOnsTitle: { en: 'Make it complete', ar: 'أكمل وجبتك' },
  addOnsSub: {
    en: 'Suggested add-ons from this restaurant',
    ar: 'إضافات مقترحة من نفس المطعم',
  },
  noAddOns: { en: 'No add-ons available', ar: 'لا توجد إضافات متاحة' },
  total: { en: 'Total', ar: 'الإجمالي' },
  skip: { en: 'No, thanks', ar: 'لا، شكراً' },
  addToCart: { en: 'Add to cart', ar: 'أضف إلى السلة' },
  language: { en: 'Language', ar: 'اللغة' },
  english: { en: 'English', ar: 'الإنجليزية' },
  arabic: { en: 'العربية', ar: 'العربية' },
  simulateOutside: {
    en: 'Simulate outside delivery zone',
    ar: 'محاكاة موقع خارج نطاق التوصيل',
  },
  simulateOutsideHint: {
    en: 'Useful for testing the geofencing flow.',
    ar: 'مفيد لاختبار تدفق التحقق الجغرافي.',
  },
};

export type StringKey = keyof typeof STRINGS;

export function getString(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale] || STRINGS[key].en;
}
