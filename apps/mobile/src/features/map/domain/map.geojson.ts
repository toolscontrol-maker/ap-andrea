import { MapPlace } from '@andrea/types';

export interface GeoJsonPointFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    title: string;
    cityName: string;
    country: string;
    date: string;
    category: MapPlace['category'];
    authorId: string;
    hasPhoto: boolean;
    isMilestone: boolean;
    photoUrl?: string;
  };
}

export interface GeoJsonLineFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [[lng, lat], ...]
  };
  properties: {
    distanceKm: number;
  };
}

export function placesToPointFeatures(places: MapPlace[]): GeoJsonPointFeature[] {
  return places.map((p) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [p.lng, p.lat],
    },
    properties: {
      id: p.id,
      title: p.title,
      cityName: p.cityName,
      country: p.country,
      date: p.date,
      category: p.category,
      authorId: p.authorId,
      hasPhoto: (p.photos && p.photos.length > 0) || false,
      isMilestone: p.isMilestone || p.category === 'primer_encuentro',
      photoUrl: p.photos?.[0],
    },
  }));
}

export function createChronologicalRouteFeature(places: MapPlace[]): GeoJsonLineFeature | null {
  if (places.length < 2) return null;
  const sorted = [...places].sort((a, b) => a.date.localeCompare(b.date));
  const coordinates: [number, number][] = sorted.map((p) => [p.lng, p.lat]);

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates,
    },
    properties: {
      distanceKm: 0,
    },
  };
}
