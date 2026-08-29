export type MapPlaceType =
  | 'memory'
  | 'restaurant'
  | 'future_place'
  | 'trip'
  | 'surprise'
  | 'important_date';

export type LocationPrecision =
  | 'exact'
  | 'approximate'
  | 'city'
  | 'hidden'
  | 'none';

export interface AndreaMapPlace {
  id: string;
  type: MapPlaceType;

  title: string;
  subtitle?: string;
  description?: string;

  latitude: number;
  longitude: number;
  precision: LocationPrecision;

  imageUrl?: string;
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
