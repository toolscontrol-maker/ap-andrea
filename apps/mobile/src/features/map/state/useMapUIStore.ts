import { useState, useCallback } from 'react';
import { MapViewportMode, SheetDetent, MapFilter } from '../domain/map.types';

export const INITIAL_MAP_FILTER: MapFilter = {
  category: 'all',
  authorId: 'all',
  dateRange: 'all',
  moodTag: 'all',
  onlyWithPhotos: false,
  onlyFuturePlans: false,
};

export interface MapUIStore {
  viewportMode: MapViewportMode;
  selectedPlaceId: string | null;
  sheetDetent: SheetDetent;
  filter: MapFilter;
  timelineCursor: string | null;
  isPlayingTimeline: boolean;
  isCarouselOpen: boolean;
  isLayersMenuOpen: boolean;
  isFilterSheetOpen: boolean;
  is3dPitch: boolean;

  setViewportMode: (mode: MapViewportMode) => void;
  selectPlace: (id: string | null, detent?: SheetDetent) => void;
  setSheetDetent: (detent: SheetDetent) => void;
  setFilter: (filter: Partial<MapFilter>) => void;
  resetFilter: () => void;
  setTimelineCursor: (date: string | null) => void;
  setIsPlayingTimeline: (playing: boolean) => void;
  toggleCarousel: () => void;
  setIsCarouselOpen: (open: boolean) => void;
  setIsLayersMenuOpen: (open: boolean) => void;
  setIsFilterSheetOpen: (open: boolean) => void;
  toggle3dPitch: () => void;
}

export function useMapUIState(): MapUIStore {
  const [viewportMode, setViewportMode] = useState<MapViewportMode>('standard');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [sheetDetent, setSheetDetent] = useState<SheetDetent>('hidden');
  const [filter, setFilterState] = useState<MapFilter>(INITIAL_MAP_FILTER);
  const [timelineCursor, setTimelineCursor] = useState<string | null>(null);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [isCarouselOpen, setIsCarouselOpen] = useState<boolean>(false);
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState<boolean>(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [is3dPitch, setIs3dPitch] = useState<boolean>(true);

  const selectPlace = useCallback((id: string | null, detent: SheetDetent = 'peek') => {
    setSelectedPlaceId(id);
    setSheetDetent(id ? detent : 'hidden');
  }, []);

  const setFilter = useCallback((partial: Partial<MapFilter>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(INITIAL_MAP_FILTER);
  }, []);

  const toggleCarousel = useCallback(() => {
    setIsCarouselOpen((prev) => !prev);
  }, []);

  const toggle3dPitch = useCallback(() => {
    setIs3dPitch((prev) => !prev);
  }, []);

  return {
    viewportMode,
    selectedPlaceId,
    sheetDetent,
    filter,
    timelineCursor,
    isPlayingTimeline,
    isCarouselOpen,
    isLayersMenuOpen,
    isFilterSheetOpen,
    is3dPitch,
    setViewportMode,
    selectPlace,
    setSheetDetent,
    setFilter,
    resetFilter,
    setTimelineCursor,
    setIsPlayingTimeline,
    toggleCarousel,
    setIsCarouselOpen,
    setIsLayersMenuOpen,
    setIsFilterSheetOpen,
    toggle3dPitch,
  };
}
