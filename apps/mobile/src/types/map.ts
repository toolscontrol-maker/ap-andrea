export type MapPlaceType =
  | 'memory'        // Recuerdo especial
  | 'restaurant'    // Restaurante / Cafetería
  | 'stage'         // Etapa (Canet, Comte del Real)
  | 'date'          // Cita con 1 o 2 destinos
  | 'trip'          // Viaje fuera de España / Escapada
  | 'future_place'  // Sueño futuro
  | 'surprise'      // Sorpresa
  | 'important_date';

export type LocationSource =
  | 'google_places'
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
  name?: string;
  formattedAddress?: string;
  city?: string;
  countryCode?: string;
  originalQuery?: string;
  provider: 'google' | 'mapbox';
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

  imageUrl?: string;
  photos?: string[];
  date?: string;
  isPrivate?: boolean;
  isRevealed?: boolean;

  color?: string;
  encryptedPayload?: string;

  // ── Etapa ──
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
  stageSummary?: string;

  // ── Recuerdo ──
  hasDateRange?: boolean;
  dateRangeEnd?: string;
  emotionTag?: string;

  // ── Cita ──
  invitedBy?: 'tonet' | 'andrea' | 'both';
  destination1?: string;
  destination2?: string;
  restaurantId?: string;

  // ── Viaje ──
  accommodation?: string;
  tripDurationDays?: number;
  visitedPlaces?: string[];
}

export interface MapBounds {
  ne: [number, number];
  sw: [number, number];
}

export interface MapCameraState {
  latitude: number;
  longitude: number;
  zoom: number;
}
