// Simulated rider GPS tracking + delivery time estimation utilities.

import { BIKE_SPEED_KMH, MIN_RIDE_MIN } from '@/constants/adminSettings';

export interface LatLng { lat: number; lng: number }

export function stepRider(current: LatLng, target: LatLng, stepKm = 0.12): LatLng {
  const dLat = target.lat - current.lat;
  const dLng = target.lng - current.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  if (dist < 0.0005) return target;
  // Approx km per degree near Egypt latitude
  const degPerKm = 1 / 111;
  const move = Math.min(stepKm * degPerKm, dist);
  const ratio = move / dist;
  return {
    lat: current.lat + dLat * ratio,
    lng: current.lng + dLng * ratio,
  };
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
}

// Bicycle ride time in minutes for a given distance (km).
export function estimateRideMinutes(distKm: number, speedKmh = BIKE_SPEED_KMH): number {
  const minutes = (distKm / Math.max(1, speedKmh)) * 60;
  return Math.max(MIN_RIDE_MIN, Math.ceil(minutes));
}

export interface DeliveryTime {
  prep: number;
  ride: number;
  total: number;
  distKm: number;
}

// Total delivery time = restaurant prep time + bicycle ride time.
export function getTotalDeliveryMinutes(
  prepMin: number,
  distKm: number
): DeliveryTime {
  const ride = estimateRideMinutes(distKm);
  return { prep: prepMin, ride, total: prepMin + ride, distKm };
}
