import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { AndreaMapPlace, MapBounds, MapCameraState } from '../../types/map';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE_URL } from '../../lib/mapbox';
import { DEFAULT_MAP_CAMERA } from './map.constants';
import { Colors } from '../../theme/colors';
import { Radii, Spacing } from '../../theme/tokens';
import { IconMapPin } from '../ui/Icons';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const idleTimeoutRef = useRef<any>(null);

  // Filter out places with 'hidden' precision if not revealed
  const visiblePlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.precision === 'none') return false;
      if (p.precision === 'hidden' && p.isRevealed === false) return false;
      return true;
    });
  }, [places]);

  // Dynamic Mapbox GL JS Loader (bypasses Metro AST dynamic import restrictions)
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_ACCESS_TOKEN || typeof window === 'undefined') return;

    let isCancelled = false;

    const loadMapboxGL = async () => {
      // 1. Load Mapbox CSS if not present
      if (!document.getElementById('mapbox-gl-css')) {
        const link = document.createElement('link');
        link.id = 'mapbox-gl-css';
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css';
        document.head.appendChild(link);
      }

      // 2. Load Mapbox JS if not loaded
      if (!(window as any).mapboxgl) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
          document.head.appendChild(script);
        });
      }

      if (isCancelled || !containerRef.current) return;

      const mapboxgl = (window as any).mapboxgl;
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE_URL,
        center: [initialCamera.longitude, initialCamera.latitude],
        zoom: initialCamera.zoom,
        pitch: 25,
        attributionControl: false,
      });

      map.on('moveend', () => {
        if (!onCameraIdle) return;
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

        idleTimeoutRef.current = setTimeout(() => {
          try {
            const bounds = map.getBounds();
            if (bounds) {
              onCameraIdle({
                ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
                sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
              });
            }
          } catch (err) {
            // Safe catch
          }
        }, 300);
      });

      mapRef.current = map;
    };

    loadMapboxGL();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCamera.latitude, initialCamera.longitude, initialCamera.zoom, onCameraIdle]);

  // Render Apple Maps Style Markers with multi-line text labels
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = typeof window !== 'undefined' ? (window as any).mapboxgl : null;
    if (!map || !mapboxgl) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    visiblePlaces.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;

      // Color mapping
      let color: string = '#38B6FF'; // Apple Maps Ocean Cyan
      let symbol = '✦';

      if (place.type === 'memory') {
        color = '#FF5376';
        symbol = '♥';
      } else if (place.type === 'restaurant') {
        color = '#FFB800';
        symbol = '🍴';
      } else if (place.type === 'trip' || place.type === 'future_place') {
        color = '#38B6FF';
        symbol = '✦';
      } else if (place.type === 'surprise') {
        color = '#FF3B30';
        symbol = '🎁';
      } else if (place.type === 'important_date') {
        color = '#FFB800';
        symbol = '📅';
      }

      // Root Container
      const rootEl = document.createElement('div');
      rootEl.className = 'apple-maps-marker-wrapper';
      rootEl.style.display = 'flex';
      rootEl.style.flexDirection = 'column';
      rootEl.style.alignItems = 'center';
      rootEl.style.justifyContent = 'center';
      rootEl.style.width = '140px';
      rootEl.style.cursor = 'pointer';
      rootEl.style.pointerEvents = 'auto';
      rootEl.style.userSelect = 'none';
      rootEl.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
      rootEl.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      rootEl.style.zIndex = isSelected ? '1000' : '10';

      // 1. Circular Orb
      const orbEl = document.createElement('div');
      orbEl.style.width = isSelected ? '40px' : '34px';
      orbEl.style.height = isSelected ? '40px' : '34px';
      orbEl.style.borderRadius = '50%';
      orbEl.style.backgroundColor = color;
      orbEl.style.border = isSelected ? '2.5px solid #FFFFFF' : '2px solid rgba(255, 255, 255, 0.95)';
      orbEl.style.boxShadow = isSelected
        ? `0 0 16px ${color}, 0 6px 14px rgba(0, 0, 0, 0.8)`
        : '0 4px 10px rgba(0, 0, 0, 0.7)';
      orbEl.style.display = 'flex';
      orbEl.style.alignItems = 'center';
      orbEl.style.justifyContent = 'center';
      orbEl.style.color = '#FFFFFF';
      orbEl.style.fontSize = isSelected ? '16px' : '14px';
      orbEl.style.fontWeight = 'bold';
      orbEl.style.transition = 'all 0.25s ease';
      orbEl.innerText = symbol;

      // 2. Multi-line Text Label
      const labelEl = document.createElement('div');
      labelEl.style.marginTop = '4px';
      labelEl.style.textAlign = 'center';
      labelEl.style.color = '#FFFFFF';
      labelEl.style.fontSize = '11px';
      labelEl.style.fontWeight = '700';
      labelEl.style.lineHeight = '13px';
      labelEl.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px rgba(0, 0, 0, 1)';
      labelEl.innerText = place.title;

      if (place.subtitle) {
        const subEl = document.createElement('div');
        subEl.style.color = 'rgba(255, 255, 255, 0.85)';
        subEl.style.fontSize = '9.5px';
        subEl.style.fontWeight = '600';
        subEl.style.marginTop = '1px';
        subEl.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.95), 0 0 2px rgba(0, 0, 0, 1)';
        subEl.innerText = place.subtitle;
        labelEl.appendChild(subEl);
      }

      rootEl.appendChild(orbEl);
      rootEl.appendChild(labelEl);

      rootEl.addEventListener('click', (e) => {
        e.stopPropagation();
        onPlacePress && onPlacePress(place);
      });

      const marker = new mapboxgl.Marker({ element: rootEl, anchor: 'top' })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [visiblePlaces, selectedPlaceId, onPlacePress]);

  // Fly to selected place
  useEffect(() => {
    if (selectedPlaceId && mapRef.current) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) {
        mapRef.current.flyTo({
          center: [selected.longitude, selected.latitude],
          zoom: Math.max(mapRef.current.getZoom(), 14),
          duration: 1000,
          essential: true,
        });
      }
    }
  }, [selectedPlaceId, places]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [DEFAULT_MAP_CAMERA.longitude, DEFAULT_MAP_CAMERA.latitude],
        zoom: DEFAULT_MAP_CAMERA.zoom,
        pitch: 25,
        duration: 1000,
      });
    }
  };

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

  return (
    <View style={styles.container}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#030C1E',
        }}
      />
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
