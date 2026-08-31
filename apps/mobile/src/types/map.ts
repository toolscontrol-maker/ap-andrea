export type MapPlaceType =
  | 'memory'        // Recuerdo especial / Rincón familiar
  | 'restaurant'    // Restaurante / Gastronomía
  | 'cafe'          // Cafetería / Brunch
  | 'bar'           // Bar / Cóctel / Tardeo
  | 'home'          // Hogar / Nuestro Nido
  | 'hotel'         // Alojamiento / Hotel / Airbnb
  | 'nature'        // Parque / Mirador / Playa / Naturaleza
  | 'shop'          // Tienda / Moda / Rincón Especial
  | 'stage'         // Etapa de vida (Canet, Comte del Real)
  | 'date'          // Cita romántica
  | 'getaway'       // Escapada de fin de semana
  | 'trip'          // Gran Viaje
  | 'future_place'  // Sueño futuro
  | 'surprise'      // Sorpresa
  | 'important_date'; // Hito oficial / Primer beso / Aniversario

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
  linkedPlaceIds?: string[];

  // ── Recuerdo ──
  hasDateRange?: boolean;
  dateRangeEnd?: string;
  emotionTag?: string;

  // ── Cita / Escapada / Hotel / Restaurante ──
  invitedBy?: 'tonet' | 'andrea' | 'both';
  destination1?: string;
  destination2?: string;
  restaurantId?: string;

  // ── Viaje / Escapada ──
  accommodation?: string;
  tripDurationDays?: number;
  visitedPlaces?: string[];
  parentExperienceId?: string;
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
