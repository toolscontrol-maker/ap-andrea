import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. Update AndreaMap.web.tsx
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
    return (places || []).filter((p) => {
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
          zoom: initialCamera.zoom || 12.5,
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
    if (!googleMaps || typeof googleMaps.Marker !== 'function') return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    markersRef.current = [];

    placeGroups.forEach((group) => {
      if (!group) return;

      const placesList = Array.isArray(group.items)
        ? group.items
        : Array.isArray((group as any).places)
        ? (group as any).places
        : [];
      const primaryPlace = placesList[0] || (group as any);
      const displayCount = group.itemCount || placesList.length || 1;
      const isMulti = displayCount > 1;

      const isSelected =
        selectedGroupId === group.id ||
        (selectedPlaceId && placesList.some((p) => p.id === selectedPlaceId));

      const lat = Number(group.latitude ?? primaryPlace?.latitude ?? 39.4699);
      const lng = Number(group.longitude ?? primaryPlace?.longitude ?? -0.3763);

      if (isNaN(lat) || isNaN(lng)) return;

      const markerType = group.dominantType || (group as any).primaryType || primaryPlace?.type || 'memory';
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
        ? '<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="22" r="18" fill="' + badgeColor + '" stroke="#FFFFFF" stroke-width="3" filter="drop-shadow(0 4px 10px rgba(58,47,56,0.18))"/><text x="22" y="27" text-anchor="middle" fill="#3A2F38" font-family="Inter, sans-serif" font-weight="bold" font-size="14">' + displayCount + '</text></svg>'
        : '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="' + badgeColor + '" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(58,47,56,0.16))"/><text x="20" y="24" text-anchor="middle" font-size="14">' + badgeIcon + '</text></svg>';

      const marker = new googleMaps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        title: group.title || primaryPlace?.title || 'Lugar',
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
        } else if (onPlacePress && primaryPlace) {
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

// 2. Update apps/mobile/app/(tabs)/map/index.tsx to connect to CloudSyncEngine
const mapIndexTs = `import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AndreaMap } from '../../../src/components/map/AndreaMap';
import { MapFilters, MapFilterKey, FILTER_TYPE_MAP } from '../../../src/components/map/MapFilters';
import { MapBottomSheet } from '../../../src/components/map/MapBottomSheet';
import { AddPlaceLocationModal } from '../../../src/components/map/AddPlaceLocationModal';
import { DEMO_MAP_PLACES } from '../../../src/components/map/map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../../src/features/places/groupMapPlaces';
import { AndreaMapPlace } from '../../../src/types/map';
import { Colors } from '../../../src/theme/colors';
import { Radii, Spacing } from '../../../src/theme/tokens';
import {
  IconPlus,
  IconLocateFixed,
  IconChevronDown,
  IconSearch,
  IconX,
  IconCompass,
  IconHeart,
  IconUtensils,
  IconSparkles,
  IconMoon,
  IconEye,
} from '../../../src/components/ui/Icons';
import { StorageEngine } from '../../../src/services/storage';
import { CloudSyncEngine } from '../../../src/services/cloud-sync/CloudSyncEngine';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAtlasMenuOpen, setIsAtlasMenuOpen] = useState(false);
  const [showOverviewCard, setShowOverviewCard] = useState(true);

  // Dynamic places state with local persistence & Supabase Cloud Sync
  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add / Edit Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      // 1. Load local places
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v5', DEMO_MAP_PLACES);
      let currentBase = DEMO_MAP_PLACES;
      if (saved && saved.length > 0) {
        const milestoneIds = DEMO_MAP_PLACES.map((p) => p.id);
        const userAddedPlaces = saved.filter((p) => !milestoneIds.includes(p.id));
        currentBase = [...DEMO_MAP_PLACES, ...userAddedPlaces];
      }
      setAllPlaces(currentBase);
      setIsLoaded(true);

      // 2. Fetch remote Supabase Cloud State
      if (CloudSyncEngine.isSupabaseConfigured()) {
        try {
          const cloudState = await CloudSyncEngine.fetchFullCloudState();
          if (cloudState && cloudState.mapPlaces && cloudState.mapPlaces.length > 0) {
            const cloudPlaces: AndreaMapPlace[] = cloudState.mapPlaces.map((mp: any) => ({
              id: mp.id,
              type: mp.category || mp.type || 'memory',
              title: mp.title,
              subtitle: mp.subtitle,
              description: mp.story || mp.description,
              latitude: Number(mp.lat || mp.latitude),
              longitude: Number(mp.lng || mp.longitude),
              precision: mp.locationPrecision || mp.precision || 'exact',
              date: mp.date,
              imageUrl: mp.photos?.[0] || mp.imageUrl,
              city: mp.cityName || mp.city,
              formattedAddress: mp.subtitle,
              source: 'google_places',
              verifiedByUser: true,
            }));

            setAllPlaces((prev) => {
              const map = new Map(prev.map(p => [p.id, p]));
              cloudPlaces.forEach(cp => map.set(cp.id, cp));
              return Array.from(map.values());
            });
          }
        } catch (e) {
          console.warn('[Map] Cloud hydration error:', e);
        }
      }
    }

    loadPlaces();

    // 3. Realtime Cross-Device Subscription
    const unsubscribe = CloudSyncEngine.subscribe({
      onEntityChange: (entity, eventType, payload) => {
        if (entity === 'map_places') {
          if (eventType === 'DELETE') {
            setAllPlaces((prev) => prev.filter((p) => p.id !== payload.id));
          } else if (payload) {
            const updatedPlace: AndreaMapPlace = {
              id: payload.id,
              type: payload.category || payload.type || 'memory',
              title: payload.title,
              subtitle: payload.subtitle,
              description: payload.story || payload.description,
              latitude: Number(payload.lat || payload.latitude),
              longitude: Number(payload.lng || payload.longitude),
              precision: payload.locationPrecision || payload.precision || 'exact',
              date: payload.date,
              imageUrl: payload.photos?.[0] || payload.imageUrl,
              city: payload.cityName || payload.city,
              formattedAddress: payload.subtitle,
              source: 'google_places',
              verifiedByUser: true,
            };

            setAllPlaces((prev) => {
              const idx = prev.findIndex((p) => p.id === updatedPlace.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updatedPlace;
                return next;
              }
              return [updatedPlace, ...prev];
            });
          }
        }
      },
      onConnectionChange: () => {},
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem('andrea_map_places_v5', allPlaces);
  }, [allPlaces, isLoaded]);

  const filteredPlaces = useMemo(() => {
    const filterTypes = FILTER_TYPE_MAP[activeFilter];
    if (filterTypes === 'all') return allPlaces;
    return allPlaces.filter((p) => filterTypes.includes(p.type));
  }, [allPlaces, activeFilter]);

  const currentGroups = useMemo(() => {
    return groupMapPlaces(filteredPlaces);
  }, [filteredPlaces]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return allPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [allPlaces, selectedPlaceId]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return currentGroups.find((g) => g.id === selectedGroupId) || null;
  }, [currentGroups, selectedGroupId]);

  const filterCounts = useMemo(() => {
    return {
      all: allPlaces.length,
      memories: allPlaces.filter((p) => FILTER_TYPE_MAP.memories.includes(p.type)).length,
      restaurants: allPlaces.filter((p) => FILTER_TYPE_MAP.restaurants.includes(p.type)).length,
      trips: allPlaces.filter((p) => FILTER_TYPE_MAP.trips.includes(p.type)).length,
      dreams: allPlaces.filter((p) => FILTER_TYPE_MAP.dreams.includes(p.type)).length,
    };
  }, [allPlaces]);

  const handlePlacePress = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('medium');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleGroupPress = useCallback((group: MapPlaceGroup) => {
    triggerHaptic('medium');
    setSelectedPlaceId(null);
    setSelectedGroupId(group.id);
  }, []);

  const handleSelectPlaceFromGroup = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleCloseSheet = useCallback(() => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  }, []);

  const handleViewDetail = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    Alert.alert(
      place.title,
      (place.subtitle || place.formattedAddress || '') + '\\n\\n' + (place.description || 'Sin descripción adicional.')
    );
  }, []);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setEditingPlace(null);
    setIsAddModalOpen(true);
  };

  const handleEditLocation = (place: AndreaMapPlace) => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
    setEditingPlace(place);
    setIsAddModalOpen(true);
  };

  const handleSaveVerifiedPlace = (place: AndreaMapPlace) => {
    setAllPlaces((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === place.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = place;
        return next;
      }
      return [place, ...prev];
    });
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
    setEditingPlace(null);

    // Sync to Supabase Cloud & Broadcast in real time
    CloudSyncEngine.syncMapPlace(place);
  };

  const handleRecenter = () => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  };

  const topOffset = Math.max(insets.top + 6, 12);
  const isSheetOpen = Boolean(selectedPlace || selectedGroup);

  return (
    <View style={styles.container}>
      {/* 1. Google Maps Canvas */}
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        selectedGroupId={selectedGroupId}
        onPlacePress={handlePlacePress}
        onGroupPress={handleGroupPress}
      />

      {/* 2. Floating Filter Chips Strip */}
      <MapFilters
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          triggerHaptic('selection');
          setActiveFilter(filter);
          setSelectedPlaceId(null);
          setSelectedGroupId(null);
        }}
        counts={filterCounts}
        topOffset={topOffset}
      />

      {/* 3. Floating Recenter / Locate Button */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlCircleBtn}
          activeOpacity={0.85}
          onPress={handleRecenter}
          accessibilityLabel="Centrar mapa en Valencia"
        >
          <IconLocateFixed size={18} color="#3A2F38" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 4. Floating Creation CTA Pill (Above Tab Bar) */}
      {!isSheetOpen && (
        <View style={styles.creationCtaWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.creationCtaPill}
            activeOpacity={0.85}
            onPress={handleOpenAddModal}
            accessibilityLabel="Guardar momento en el mapa"
          >
            <IconPlus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.creationCtaText}>Guardar momento</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. Warm Light Bottom Sheet */}
      <MapBottomSheet
        place={selectedPlace}
        group={selectedGroup}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
        onSelectPlaceFromGroup={handleSelectPlaceFromGroup}
      />

      {/* 6. Add / Edit Place Location Modal with Google Maps & Places */}
      <AddPlaceLocationModal
        visible={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlace(null);
        }}
        onSavePlace={handleSaveVerifiedPlace}
        initialPlace={editingPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
    width: '100%',
    height: '100%',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: 76,
    gap: 8,
    zIndex: 20,
  },
  controlCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  creationCtaWrapper: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  creationCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF826A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: '#EF826A',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  creationCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
  },
});
`;

fs.writeFileSync(path.join(mobileRoot, 'app', '(tabs)', 'map', 'index.tsx'), mapIndexTs, 'utf8');

console.log('✅ Realtime cloud sync & group items alignment updated cleanly.');
`;

fs.writeFileSync(path.join(projectRoot, 'scratch', 'setup_realtime_map_clean.mjs'), cleanScript, 'utf8');
