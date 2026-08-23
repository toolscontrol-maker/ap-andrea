import { MapPlace, LocationPrecision, MemoryVisibility } from '@andrea/types';

export type MapViewportMode = 'standard' | 'satellite' | 'globe3d';

export type SheetDetent = 'hidden' | 'peek' | 'medium' | 'large';

export type MapCategoryFilter = 'all' | 'viaje' | 'escapada' | 'cita' | 'primer_encuentro' | 'especial';

export type DateRangeFilter = 'all' | 'this_year' | 'last_year' | 'custom';

export type MoodTagFilter = 'all' | 'love' | 'grateful' | 'happy' | 'calm' | 'excited';

export interface MapFilter {
  category: MapCategoryFilter;
  authorId: 'all' | string;
  dateRange: DateRangeFilter;
  moodTag: MoodTagFilter;
  onlyWithPhotos?: boolean;
  onlyFuturePlans?: boolean;
}

export interface MapMetrics {
  totalMemories: number;
  uniqueCities: number;
  uniqueCountries: number;
  totalDistanceKm: number; // Geodesic approximate distance
}

export interface TimelineMilestone {
  date: string;
  formattedDate: string;
  narrativeText: string;
  places: MapPlace[];
  cumulativeDistanceKm: number;
}

export const MapColors = {
  mapAccent: '#E86A58',
  mapAccentSoft: '#F9DED8',
  mapInk: '#1E252B',
  mapMuted: '#66737C',
  mapSurface: 'rgba(255, 255, 255, 0.88)',
  mapSurfaceDark: 'rgba(20, 27, 32, 0.88)',
  mapTravel: '#4A7C9B',
  mapGold: '#CBA86A',
  mapSage: '#6D9E79',
} as const;

export const MapTypography = {
  largeTitle: 34,
  title2: 22,
  headline: 17,
  body: 17,
  subheadline: 15,
  caption: 13,
  overline: 12,
} as const;
