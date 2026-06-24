// OpenStreetMap (Nominatim) integration for address search & reverse geocoding.
// The base URL and tuning live in `constants/adminSettings.ts` (OSM_API) so
// an admin can swap providers or self-host Nominatim without code changes.

import { OSM_API } from '@/constants/adminSettings';
import { LatLng } from './tracking';

export interface OsmAddressResult {
  id: string;
  displayName: string;
  shortName: string; // best-effort short label for display in lists
  area: string; // suburb / city district extracted from the result
  location: LatLng;
  raw?: any;
}

interface NominatimSearchHit {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

function buildShortName(hit: NominatimSearchHit): string {
  const a = hit.address || {};
  const main =
    a.road ||
    a.neighbourhood ||
    a.suburb ||
    a.village ||
    a.town ||
    a.city ||
    '';
  const sub = a.suburb || a.city_district || a.city || a.state || '';
  if (main && sub && main !== sub) return `${main} · ${sub}`;
  return main || hit.display_name.split(',')[0] || hit.display_name;
}

function buildArea(hit: NominatimSearchHit): string {
  const a = hit.address || {};
  return a.suburb || a.city_district || a.neighbourhood || a.city || a.town || a.village || 'مدينة السادات';
}

function mapHit(hit: NominatimSearchHit): OsmAddressResult {
  return {
    id: String(hit.place_id),
    displayName: hit.display_name,
    shortName: buildShortName(hit),
    area: buildArea(hit),
    location: { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) },
    raw: hit,
  };
}

const defaultHeaders: Record<string, string> = {
  'Accept-Language': OSM_API.language,
  'User-Agent': OSM_API.userAgent,
};

/**
 * Search OSM/Nominatim for an address query. Returns up to `searchLimit`
 * results biased to the configured `countryCode`.
 */
export async function searchAddress(query: string): Promise<OsmAddressResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const params = new URLSearchParams({
    q,
    format: 'json',
    addressdetails: '1',
    limit: String(OSM_API.searchLimit),
    countrycodes: OSM_API.countryCode,
    'accept-language': OSM_API.language,
  });
  const url = `${OSM_API.baseUrl}${OSM_API.searchPath}?${params.toString()}`;
  try {
    const resp = await fetch(url, { headers: defaultHeaders });
    if (!resp.ok) return [];
    const data = (await resp.json()) as NominatimSearchHit[];
    return data.map(mapHit);
  } catch {
    return [];
  }
}

/**
 * Reverse geocode a LatLng to a human-readable address.
 */
export async function reverseAddress(loc: LatLng): Promise<OsmAddressResult | null> {
  const params = new URLSearchParams({
    lat: String(loc.lat),
    lon: String(loc.lng),
    format: 'json',
    addressdetails: '1',
    'accept-language': OSM_API.language,
  });
  const url = `${OSM_API.baseUrl}${OSM_API.reversePath}?${params.toString()}`;
  try {
    const resp = await fetch(url, { headers: defaultHeaders });
    if (!resp.ok) return null;
    const data = (await resp.json()) as NominatimSearchHit;
    if (!data) return null;
    return mapHit(data);
  } catch {
    return null;
  }
}
