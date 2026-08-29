import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AndreaMapPlace, MapBounds, MapCameraState } from '../../types/map';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL, Mapbox } from '../../lib/mapbox';
import { DEFAULT_MAP_CAMERA } from './map.constants';
import { MapMarker } from './MapMarker';
import { Radii, Spacing } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

export interface AndreaMapProps {
  places: AndreaMapPlace[];
  selectedPlaceId?: string | null;
  initialCamera?: MapCameraState;
  activeFilters?: string[];
  onPlacePress?: (place: AndreaMapPlace) => void;
  onCameraIdle?: (bounds: MapBounds) => void;
  onAddPlacePress?: () => void;
}

export function AndreaMap({
  places,
  selectedPlaceId,
  initialCamera = DEFAULT_MAP_CAMERA,
  onPlacePress,
  onCameraIdle,
}: AndreaMapProps) {
  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const idleTimeoutRef = useRef<any>(null);

  // Filter out places with 'hidden' precision if not revealed
  const visiblePlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.precision === 'none') return false;
      if (p.precision === 'hidden' && p.isRevealed === false) return false;
      return true;
    });
  }, [places]);

  // Fly to selected place
  useEffect(() => {
    if (selectedPlaceId && cameraRef.current) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) {
        cameraRef.current.setCamera({
          centerCoordinate: [selected.longitude, selected.latitude],
          zoomLevel: 14,
          animationDuration: 1000,
          animationMode: 'flyTo',
        });
      }
    }
  }, [selectedPlaceId, places]);

  const handleRegionDidChange = useCallback(async () => {
    if (!onCameraIdle || !mapRef.current) return;
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

    idleTimeoutRef.current = setTimeout(async () => {
      try {
        const bounds = await mapRef.current.getVisibleBounds();
        if (bounds && bounds.length === 2) {
          onCameraIdle({
            ne: bounds[0],
            sw: bounds[1],
          });
        }
      } catch (err) {
        // Safe catch
      }
    }, 300);
  }, [onCameraIdle]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Falta EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN</Text>
        <Text style={styles.errorSubtitle}>
          Configúralo en apps/mobile/.env para renderizar el mapa de Mapbox.
        </Text>
      </View>
    );
  }

  if (!Mapbox || !Mapbox.MapView) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Mapbox Native Module</Text>
        <Text style={styles.errorSubtitle}>
          Se requiere un Expo Development Build (npx expo run:ios / run:android) para ejecutar @rnmapbox/maps en nativo.
        </Text>
      </View>
    );
  }

  const { MapView, Camera, PointAnnotation } = Mapbox;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MAPBOX_STYLE_URL}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [initialCamera.longitude, initialCamera.latitude],
            zoomLevel: initialCamera.zoom,
            pitch: 25,
          }}
        />

        {visiblePlaces.map((place) => (
          <PointAnnotation
            key={place.id}
            id={place.id}
            coordinate={[place.longitude, place.latitude]}
            onSelected={() => {
              triggerHaptic('selection');
              onPlacePress && onPlacePress(place);
            }}
          >
            <MapMarker
              place={place}
              isSelected={place.id === selectedPlaceId}
              onPress={() => {
                triggerHaptic('selection');
                onPlacePress && onPlacePress(place);
              }}
            />
          </PointAnnotation>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#030C1E',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: '#030C1E',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B81',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    maxWidth: 320,
  },
});
