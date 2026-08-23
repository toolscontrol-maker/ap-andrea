import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../context/DevContext';
import { useMapUIState } from '../state/useMapUIStore';
import { filterPlaces } from '../domain/map.selectors';
import { calculateMapMetrics } from '../domain/map.metrics';
import { triggerHaptic } from '../../../utils/haptics';
import { MapCanvas } from './MapCanvas';
import { MapTopBar } from './MapTopBar';
import { MapControls } from './MapControls';
import { MapLayerMenu } from './MapLayerMenu';
import { MapFilterSheet } from './MapFilterSheet';
import { MemoryPlaceCard } from './MemoryPlaceCard';
import { MemoryDetailSheet } from './MemoryDetailSheet';
import { TimelineScrubber } from './TimelineScrubber';
import { MemoriesCarousel } from './MemoriesCarousel';
import { EmptyMapState } from './EmptyMapState';

export function MapScreen() {
  const router = useRouter();
  const { places, currentDevUser, partnerDevUser } = useDev();
  const ui = useMapUIState();

  // 1. Visible places
  const visiblePlaces = useMemo(() => {
    return filterPlaces(places, ui.filter, ui.timelineCursor);
  }, [places, ui.filter, ui.timelineCursor]);

  // 2. Metrics
  const metrics = useMemo(() => {
    return calculateMapMetrics(visiblePlaces);
  }, [visiblePlaces]);

  // 3. Selected place
  const selectedPlace = useMemo(() => {
    if (!ui.selectedPlaceId) return null;
    return places.find((p) => p.id === ui.selectedPlaceId) || null;
  }, [places, ui.selectedPlaceId]);

  const hasActiveFilters =
    ui.filter.category !== 'all' ||
    ui.filter.authorId !== 'all' ||
    ui.filter.dateRange !== 'all' ||
    ui.filter.moodTag !== 'all';

  const handleSelectPlaceId = (id: string) => {
    triggerHaptic('medium');
    ui.selectPlace(id, 'peek');
  };

  const handleTapBackground = () => {
    if (ui.selectedPlaceId) {
      triggerHaptic('light');
      ui.selectPlace(null, 'hidden');
    }
  };

  const handleFitAll = () => {
    if (Platform.OS === 'web') {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((ifr) => {
        ifr.contentWindow?.postMessage({ type: 'FIT_ALL_BOUNDS' }, '*');
      });
    }
  };

  const handleZoomIn = () => {
    if (Platform.OS === 'web') {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((ifr) => {
        ifr.contentWindow?.postMessage({ type: 'ZOOM_IN' }, '*');
      });
    }
  };

  const handleZoomOut = () => {
    if (Platform.OS === 'web') {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((ifr) => {
        ifr.contentWindow?.postMessage({ type: 'ZOOM_OUT' }, '*');
      });
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* 1. Full-Screen Canvas Engine (MapLibre or Three.js Globe) */}
      <MapCanvas
        places={visiblePlaces}
        selectedPlaceId={ui.selectedPlaceId}
        onSelectPlaceId={handleSelectPlaceId}
        onTapBackground={handleTapBackground}
        viewportMode={ui.viewportMode}
        is3dPitch={ui.is3dPitch}
      />

      {/* 2. iOS Glass Top Bar (Respects Notch / Dynamic Island) */}
      <MapTopBar
        metrics={metrics}
        onOpenLayers={() => ui.setIsLayersMenuOpen(true)}
        onOpenFilters={() => ui.setIsFilterSheetOpen(true)}
        onAddNewMemory={() => router.push('/(tabs)/map/new')}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 3. Floating Controls (3D tilt, compass, zoom, carousel, timeline) */}
      <MapControls
        is3dPitch={ui.is3dPitch}
        onTogglePitch={ui.toggle3dPitch}
        onFitAll={handleFitAll}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isCarouselOpen={ui.isCarouselOpen}
        onToggleCarousel={ui.toggleCarousel}
        isTimelineOpen={!!ui.timelineCursor}
        onToggleTimeline={() => {
          if (ui.timelineCursor) {
            ui.setTimelineCursor(null);
            ui.setIsPlayingTimeline(false);
          } else {
            const firstDate = visiblePlaces[0]?.date || null;
            ui.setTimelineCursor(firstDate);
          }
        }}
        isGlobeMode={ui.viewportMode === 'globe3d'}
      />

      {/* 4. Contextual Bottom Place Card (Peek state when a place is selected) */}
      {selectedPlace && ui.sheetDetent === 'peek' && !ui.isCarouselOpen && (
        <MemoryPlaceCard
          place={selectedPlace}
          onOpenDetails={() => ui.setSheetDetent('large')}
          onClose={() => ui.selectPlace(null, 'hidden')}
        />
      )}

      {/* 5. Expanded Memory Detail Sheet (Large modal sheet) */}
      <MemoryDetailSheet
        visible={ui.sheetDetent === 'large'}
        place={selectedPlace}
        onClose={() => ui.setSheetDetent(selectedPlace ? 'peek' : 'hidden')}
        currentUserId={currentDevUser.id}
        partnerName={partnerDevUser.name}
      />

      {/* 6. On-Demand Memories Carousel */}
      <MemoriesCarousel
        visible={ui.isCarouselOpen}
        places={visiblePlaces}
        selectedPlaceId={ui.selectedPlaceId}
        onSelectPlaceId={(id) => {
          ui.selectPlace(id, 'peek');
        }}
        onClose={() => ui.setIsCarouselOpen(false)}
      />

      {/* 7. Interactive Timeline Scrubber */}
      {ui.timelineCursor && !selectedPlace && !ui.isCarouselOpen && (
        <TimelineScrubber
          places={places}
          timelineCursor={ui.timelineCursor}
          onCursorChange={ui.setTimelineCursor}
          isPlaying={ui.isPlayingTimeline}
          onTogglePlay={() => ui.setIsPlayingTimeline(!ui.isPlayingTimeline)}
        />
      )}

      {/* 8. Layers Menu Sheet */}
      <MapLayerMenu
        visible={ui.isLayersMenuOpen}
        onClose={() => ui.setIsLayersMenuOpen(false)}
        currentMode={ui.viewportMode}
        onSelectMode={ui.setViewportMode}
      />

      {/* 9. Filters Sheet */}
      <MapFilterSheet
        visible={ui.isFilterSheetOpen}
        onClose={() => ui.setIsFilterSheetOpen(false)}
        filter={ui.filter}
        onApplyFilter={ui.setFilter}
        onResetFilter={ui.resetFilter}
        matchingCount={visiblePlaces.length}
        partnerName={partnerDevUser.name}
      />

      {/* 10. Empty State */}
      {visiblePlaces.length === 0 && (
        <EmptyMapState onAddFirstMemory={() => router.push('/(tabs)/map/new')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF6F0',
    position: 'relative',
    overflow: 'hidden',
  },
});
