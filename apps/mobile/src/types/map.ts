export type MapPlaceType =
  | 'memory'
  | 'restaurant'
  | 'future_place'
  | 'trip'
  | 'surprise'
  | 'important_date';

export type LocationSource =
  | 'mapbox_search'
  | 'manual_pin'
  | 'device_location'
  | 'city_centroid'
  | 'imported'
  | 'legacy_mock';

export type LocationPrecision =
  | 'exact'
  | 'approximate'
  | 'city'
  | 'hidden'
  | 'none';

export interface VerifiedLocation {
  latitude: number;
  longitude: number;
  source: LocationSource;
  precision: LocationPrecision;
  verifiedByUser: boolean;
  verifiedAt?: string;
  mapboxId?: string;
  mapboxFeatureType?: string;
  mapboxRelevance?: number;
  name?: string;
  formattedAddress?: string;
  city?: string;
  countryCode?: string;
  originalQuery?: string;
  provider: 'mapbox';
  providerVersion?: 'search-box-v1' | 'geocoding-v5';
}

export interface AndreaMapPlace {
  id: string;
  type: MapPlaceType;

  title: string;
  subtitle?: string;
  description?: string;

  latitude: number;
  longitude: number;
  precision: LocationPrecision;
  source?: LocationSource;
  verifiedByUser?: boolean;
  formattedAddress?: string;
  city?: string;
  mapboxId?: string;

  imageUrl?: string;
  photos?: string[];
  date?: string;
  isPrivate?: boolean;
  isRevealed?: boolean;

  color?: string;
  encryptedPayload?: string;
}

export interface MapBounds {
  ne: [number, number]; // [lng, lat]
  sw: [number, number]; // [lng, lat]
}

export interface MapCameraState {
  latitude: number;
  longitude: number;
  zoom: number;
}
