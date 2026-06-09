// Al-Sadat City geofence + app config

export const APP = {
  name: 'Etlob',
  nameAr: 'اطلب',
  city: 'Al-Sadat City',
  cityAr: 'مدينة السادات',
};

// Approximate Al-Sadat city center
export const SADAT_CENTER = { lat: 30.3636, lng: 30.5078 };
export const SADAT_RADIUS_KM = 12; // delivery radius

export const REFERRAL = {
  goal: 10,
  reward: 'Free delivery',
};

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash on delivery', icon: 'attach-money', requiresProof: false },
  { id: 'vodafone', label: 'Vodafone Cash', icon: 'phone-iphone', requiresProof: true },
  { id: 'instapay', label: 'InstaPay', icon: 'account-balance', requiresProof: true },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id'];
