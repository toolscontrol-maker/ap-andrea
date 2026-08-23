import { MapPlace } from '@andrea/types';
import { MapMetrics } from './map.types';
import { calculateTotalRouteDistance } from '../utils/coordinates';

export function calculateMapMetrics(places: MapPlace[]): MapMetrics {
  const uniqueCities = new Set(places.map((p) => p.cityName.trim().toLowerCase())).size;
  const uniqueCountries = new Set(places.map((p) => p.country.trim().toLowerCase())).size;

  // Chronologically sorted places for distance calculation
  const sorted = [...places].sort((a, b) => a.date.localeCompare(b.date));
  const totalDistanceKm = calculateTotalRouteDistance(sorted);

  return {
    totalMemories: places.length,
    uniqueCities,
    uniqueCountries,
    totalDistanceKm,
  };
}
