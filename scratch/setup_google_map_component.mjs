import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. Write apps/mobile/src/services/googlePlacesGeocoding.ts
const geocodingTs = `import { loadGoogleMapsSDK, GOOGLE_MAPS_API_KEY } from '../lib/googleMaps';

export interface GeocodingResult {
  id: string;
  name: string;
  formattedAddress: string;
  city?: string;
  country?: string;
  coordinates: [number, number]; // [longitude, latitude] !!
  featureType: string;
  relevance: number;
  category?: string;
  placeId?: string;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
}

export interface SearchOptions {
  proximity?: [number, number]; // [longitude, latitude]
  country?: string; // e.g. 'es'
  types?: string;
}

/**
 * Search places using Google Places Autocomplete / Geocoder
 */
export async function searchGooglePlaces(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (!googleMaps) {
      return searchGooglePlacesViaRest(q, options);
    }

    const geocoder = new googleMaps.Geocoder();
    const centerLat = options?.proximity ? options.proximity[1] : 39.4699;
    const centerLng = options?.proximity ? options.proximity[0] : -0.3763;

    return new Promise((resolve) => {
      geocoder.geocode(
        {
          address: q,
          componentRestrictions: { country: options?.country || 'es' },
          bounds: new googleMaps.LatLngBounds(
            new googleMaps.LatLng(centerLat - 0.25, centerLng - 0.25),
            new googleMaps.LatLng(centerLat + 0.25, centerLng + 0.25)
          ),
        },
        (results: any[], status: string) => {
          if (status !== 'OK' || !results || results.length === 0) {
            resolve([]);
            return;
          }

          const parsed: GeocodingResult[] = results.slice(0, 6).map((item, index) => {
            const lat = item.geometry.location.lat();
            const lng = item.geometry.location.lng();
            const addressComponents = item.address_components || [];

            let city = 'Valencia';
            let country = 'España';

            for (const comp of addressComponents) {
              if (comp.types.includes('locality')) city = comp.long_name;
              if (comp.types.includes('country')) country = comp.long_name;
            }

            const name = item.formatted_address.split(',')[0] || q;

            return {
              id: item.place_id || ('gplace-' + index + '-' + Date.now()),
              placeId: item.place_id,
              name,
              formattedAddress: item.formatted_address,
              city,
              country,
              coordinates: [lng, lat],
              featureType: item.types?.[0] || 'poi',
              relevance: 1 - index * 0.1,
            };
          });

          resolve(parsed);
        }
      );
    });
  } catch (err) {
    console.warn('[GooglePlaces] Search failed, fallback:', err);
    return searchGooglePlacesViaRest(q, options);
  }
}

/**
 * Fallback REST search
 */
async function searchGooglePlacesViaRest(
  query: string,
  options?: SearchOptions
): Promise<GeocodingResult[]> {
  try {
    const lat = options?.proximity ? options.proximity[1] : 39.4699;
    const lng = options?.proximity ? options.proximity[0] : -0.3763;
    const url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(query) + '&components=country:es&key=' + GOOGLE_MAPS_API_KEY;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return [];

    return data.results.slice(0, 6).map((item: any, idx: number) => {
      const lat = item.geometry.location.lat;
      const lng = item.geometry.location.lng;
      return {
        id: item.place_id || ('rest-' + idx),
        name: item.formatted_address.split(',')[0] || query,
        formattedAddress: item.formatted_address,
        city: 'Valencia',
        country: 'España',
        coordinates: [lng, lat],
        featureType: item.types?.[0] || 'poi',
        relevance: 1,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Reverse Geocode: [lng, lat] -> Real address string
 */
export async function reverseGeocodeGoogleCoordinates(
  coordinates: [number, number]
): Promise<GeocodingResult | null> {
  const [lng, lat] = coordinates;

  try {
    const googleMaps = await loadGoogleMapsSDK();
    if (!googleMaps) return null;

    const geocoder = new googleMaps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
        if (status !== 'OK' || !results || results.length === 0) {
          resolve(null);
          return;
        }

        const best = results[0];
        let city = 'Valencia';
        let country = 'España';

        for (const comp of best.address_components || []) {
          if (comp.types.includes('locality')) city = comp.long_name;
          if (comp.types.includes('country')) country = comp.long_name;
        }

        resolve({
          id: best.place_id || ('rev-' + Date.now()),
          name: best.formatted_address.split(',')[0] || 'Punto seleccionado',
          formattedAddress: best.formatted_address,
          city,
          country,
          coordinates: [lng, lat],
          featureType: best.types?.[0] || 'address',
          relevance: 1.0,
        });
      });
    });
  } catch (err) {
    console.warn('[GooglePlaces] Reverse geocoding failed:', err);
    return null;
  }
}
`;

fs.writeFileSync(path.join(mobileRoot, 'src', 'services', 'googlePlacesGeocoding.ts'), geocodingTs, 'utf8');

// 2. Write apps/mobile/src/components/map/AndreaMap.web.tsx
const andreaMapWebTs = `import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { AndreaMapPlace, MapBounds, MapCameraState } from '../../types/map';
import { loadGoogleMapsSDK, ANDREA_GOOGLE_MAP_STYLES } from '../../lib/googleMaps';
import { DEFAULT_MAP_CAMERA } from './map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../features/places/groupMapPlaces';
import { triggerHaptic } from '../../utils/haptics';
import { Colors } from '../../theme/colors';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 1. Filter out unrevealed secret places
  const visiblePlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.precision === 'none') return false;
      if (p.precision === 'hidden' && p.isRevealed === false) return false;
      return true;
    });
  }, [places]);

  // 2. Group places by exact spot or proximity
  const placeGroups = useMemo(() => {
    return groupMapPlaces(visiblePlaces);
  }, [visiblePlaces]);

  // 3. Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    if (!containerRef.current) return;

    loadGoogleMapsSDK()
      .then((googleMaps) => {
        if (!isMounted || !containerRef.current || !googleMaps) return;

        const map = new googleMaps.Map(containerRef.current, {
          center: {
            lat: initialCamera.latitude || 39.4699,
            lng: initialCamera.longitude || -0.3763,
          },
          zoom: initialCamera.zoom || 13,
          styles: ANDREA_GOOGLE_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          backgroundColor: '#FFF8F2',
        });

        mapRef.current = map;
        setIsMapReady(true);

        map.addListener('idle', () => {
          if (!onCameraIdle) return;
          const bounds = map.getBounds();
          if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();
            onCameraIdle({
              north: ne.lat(),
              south: sw.lat(),
              east: ne.lng(),
              west: sw.lng(),
            });
          }
        });
      })
      .catch((err) => {
        console.error('[AndreaMap] Google Maps load error:', err);
        if (isMounted) setLoadError(err.message || 'Error cargando Google Maps');
      });

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.setMap && m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // 4. Render and update custom markers
  useEffect(() => {
    if (!isMapReady || !mapRef.current || typeof window === 'undefined') return;

    const googleMaps = (window as any).google?.maps;
    if (!googleMaps) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    markersRef.current = [];

    placeGroups.forEach((group) => {
      const isSelected =
        selectedGroupId === group.id ||
        (selectedPlaceId && group.places.some((p) => p.id === selectedPlaceId));

      const isMulti = group.count > 1;
      const primaryPlace = group.places[0];

      // Custom marker icon HTML/SVG
      const markerType = group.primaryType;
      let badgeColor = '#EF826A'; // Coral
      let badgeIcon = '❤️';

      if (markerType === 'restaurant') {
        badgeColor = '#F4C95D'; // Butter
        badgeIcon = '🍽️';
      } else if (markerType === 'trip' || markerType === 'future_place') {
        badgeColor = '#9E8ACD'; // Lavender
        badgeIcon = '🧭';
      } else if (markerType === 'surprise') {
        badgeColor = '#83A98C'; // Sage
        badgeIcon = '🎁';
      }

      const pinSvg = isMulti
        ? '<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="18" fill="' + badgeColor + '" stroke="#FFFFFF" stroke-width="3" filter="drop-shadow(0 4px 10px rgba(58,47,56,0.18))"/><text x="22" y="27" text-anchor="middle" fill="#3A2F38" font-family="Inter, sans-serif" font-weight="bold" font-size="14">' + group.count + '</text></svg>'
        : '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="' + badgeColor + '" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(58,47,56,0.16))"/><text x="20" y="24" text-anchor="middle" font-size="14">' + badgeIcon + '</text></svg>';

      const marker = new googleMaps.Marker({
        position: { lat: group.latitude, lng: group.longitude },
        map: mapRef.current,
        title: group.title,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new googleMaps.Size(isMulti ? 44 : 40, isMulti ? 44 : 40),
          anchor: new googleMaps.Point(isMulti ? 22 : 20, isMulti ? 22 : 20),
        },
        zIndex: isSelected ? 999 : isMulti ? 100 : 10,
        animation: isSelected ? googleMaps.Animation.BOUNCE : undefined,
      });

      marker.addListener('click', () => {
        triggerHaptic('selection');
        if (isMulti && onGroupPress) {
          onGroupPress(group);
        } else if (onPlacePress) {
          onPlacePress(primaryPlace);
        }
      });

      markersRef.current.push(marker);
    });
  }, [isMapReady, placeGroups, selectedPlaceId, selectedGroupId]);

  // 5. Smooth Camera Panning on Place Selection
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedPlaceId) {
      const selected = visiblePlaces.find((p) => p.id === selectedPlaceId);
      if (selected) {
        mapRef.current.panTo({ lat: selected.latitude, lng: selected.longitude });
        mapRef.current.setZoom(16);
      }
    } else if (selectedGroupId) {
      const group = placeGroups.find((g) => g.id === selectedGroupId);
      if (group) {
        mapRef.current.panTo({ lat: group.latitude, lng: group.longitude });
        mapRef.current.setZoom(16);
      }
    }
  }, [selectedPlaceId, selectedGroupId, visiblePlaces, placeGroups]);

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
          backgroundColor: '#FFF8F2',
        }}
      />

      {!isMapReady && !loadError && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Cargando Google Maps...</Text>
        </View>
      )}

      {loadError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>No se pudo cargar Google Maps.</Text>
          <Text style={styles.errorSubtext}>{loadError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF8F2',
    overflow: 'hidden',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#766B72',
    fontFamily: 'Inter, sans-serif',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 10,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A2F38',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
  },
});
`;

fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'AndreaMap.web.tsx'), andreaMapWebTs, 'utf8');

console.log('✅ Google Places Geocoding and AndreaMap.web.tsx created.');
