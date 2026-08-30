import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { AndreaMapPlace, MapBounds, MapCameraState } from '../../types/map';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL, Mapbox } from '../../lib/mapbox';
import { DEFAULT_MAP_CAMERA, MAP_CLUSTER_CONFIG } from './map.constants';
import { MapMarker } from './MapMarker';
import { groupMapPlaces, MapPlaceGroup } from '../../features/places/groupMapPlaces';
import { Radii, Spacing } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';

export interface AndreaMapProps {
  places: AndreaMapPlace[];
  selectedPlaceId?: string | null;
  selectedGroupId?: string | null;
  initialCamera?: MapCameraState;
  activeFilters?: string[];
  onPlacePress?: (place: AndreaMapPlace) => void;
  onGroupPress?: (group: MapPlaceGroup) => void;
  onCameraIdle?: (bounds: MapBounds) => void;
  onAddPlacePress?: () => void;
}

export function AndreaMap({
  places,
  selectedPlaceId,
  selectedGroupId,
  initialCamera = DEFAULT_MAP_CAMERA,
  onPlacePress,
  onGroupPress,
  onCameraIdle,
}: AndreaMapProps) {
  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const shapeSourceRef = useRef<any>(null);
  const idleTimeoutRef = useRef<any>(null);

  // Filter out places with 'hidden' precision if not revealed
  const visiblePlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.precision === 'none') return false;
      if (p.precision === 'hidden' && p.isRevealed === false) return false;
      return true;
    });
  }, [places]);

  // Group places within 20m / same address
  const placeGroups = useMemo(() => {
    return groupMapPlaces(visiblePlaces);
  }, [visiblePlaces]);

  // Fly to selected place
  useEffect(() => {
    if (selectedPlaceId && cameraRef.current) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) {
        cameraRef.current.setCamera({
          centerCoordinate: [selected.longitude, selected.latitude],
          zoomLevel: 15,
          animationDuration: 700,
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

        {placeGroups.map((group) => {
          const isSamePlaceGroup = group.kind === 'same_place_group';
          const primaryPlace = group.items[0];
          const isSelected =
            (selectedGroupId && selectedGroupId === group.id) ||
            (selectedPlaceId && group.items.some((i) => i.id === selectedPlaceId));

          return (
            <PointAnnotation
              key={group.id}
              id={group.id}
              coordinate={[group.longitude, group.latitude]}
              onSelected={() => {
                triggerHaptic('selection');
                if (isSamePlaceGroup && onGroupPress) {
                  onGroupPress(group);
                } else if (onPlacePress) {
                  onPlacePress(primaryPlace);
                }
              }}
            >
              <MapMarker
                place={primaryPlace}
                itemCount={group.itemCount}
                isSelected={!!isSelected}
                onPress={() => {
                  triggerHaptic('selection');
                  if (isSamePlaceGroup && onGroupPress) {
                    onGroupPress(group);
                  } else if (onPlacePress) {
                    onPlacePress(primaryPlace);
                  }
                }}
              />
            </PointAnnotation>
          );
        })}
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
