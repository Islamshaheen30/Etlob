// Vehicle-aware fee + ETA calculations driven by admin-managed VEHICLE_RATES.
// One source of truth for both customer pricing and rider routing.

import {
  MIN_RIDE_MIN,
  VEHICLE_RATES,
  VehicleRate,
  VehicleType,
  getVehicleRate,
} from '@/constants/adminSettings';

export interface VehicleQuote {
  rate: VehicleRate;
  fee: number;
  rideMinutes: number;
  distKm: number;
}

// Calculate the customer-facing delivery fee for a vehicle over a distance.
// Supports two admin-defined modes: 'flat' (fixed price) or 'per_km'
// (baseFee + perKmFee * distance, capped to minFee).
export function calculateVehicleFee(rate: VehicleRate, distKm: number): number {
  if (rate.mode === 'flat') {
    return rate.flatFee || 0;
  }
  const base = rate.baseFee || 0;
  const variable = (rate.perKmFee || 0) * Math.max(0, distKm);
  const computed = Math.round(base + variable);
  if (rate.minFee != null && computed < rate.minFee) return rate.minFee;
  return computed;
}

// Estimated minutes on the road for a given vehicle and distance.
export function estimateVehicleRideMinutes(rate: VehicleRate, distKm: number): number {
  const minutes = (Math.max(0, distKm) / Math.max(1, rate.speedKmh)) * 60;
  return Math.max(MIN_RIDE_MIN, Math.ceil(minutes));
}

export function getVehicleQuote(id: VehicleType, distKm: number): VehicleQuote {
  const rate = getVehicleRate(id);
  return {
    rate,
    fee: calculateVehicleFee(rate, distKm),
    rideMinutes: estimateVehicleRideMinutes(rate, distKm),
    distKm,
  };
}

export function getAllVehicleQuotes(distKm: number): VehicleQuote[] {
  return VEHICLE_RATES.filter((v) => v.active).map((rate) => ({
    rate,
    fee: calculateVehicleFee(rate, distKm),
    rideMinutes: estimateVehicleRideMinutes(rate, distKm),
    distKm,
  }));
}

// Pick a plausible vehicle type for a given distance — used by the driver
// mock queue generator so demo data feels realistic.
export function pickVehicleForDistance(distKm: number): VehicleType {
  if (distKm < 1.5) {
    return Math.random() < 0.7 ? 'bicycle' : 'scooter';
  }
  if (distKm < 3.5) {
    const r = Math.random();
    if (r < 0.4) return 'bicycle';
    if (r < 0.8) return 'scooter';
    return 'motorcycle';
  }
  return Math.random() < 0.6 ? 'motorcycle' : 'scooter';
}
