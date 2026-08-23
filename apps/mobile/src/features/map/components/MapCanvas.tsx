import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MapPlace } from '@andrea/types';
import { MapViewportMode } from '../domain/map.types';
import { UnifiedMapboxEngine } from '../engines/mapbox/UnifiedMapboxEngine';

interface MapCanvasProps {
  places: MapPlace[];
  selectedPlaceId: string | null;
  onSelectPlaceId: (id: string) => void;
  onTapBackground?: () => void;
  viewportMode: MapViewportMode;
  is3dPitch?: boolean;
}

export function MapCanvas({
  places,
  selectedPlaceId,
  onSelectPlaceId,
  onTapBackground,
  viewportMode,
  is3dPitch,
}: MapCanvasProps) {
  return (
    <View style={styles.canvasContainer}>
      <UnifiedMapboxEngine
        places={places}
        selectedPlaceId={selectedPlaceId}
        onSelectPlaceId={onSelectPlaceId}
        onTapBackground={onTapBackground}
        viewportMode={viewportMode}
        is3dPitch={is3dPitch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});
