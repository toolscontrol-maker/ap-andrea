import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AndreaMap } from '../../../src/components/map/AndreaMap';
import { MapFilters, MapFilterKey, FILTER_TYPE_MAP } from '../../../src/components/map/MapFilters';
import { MapBottomSheet } from '../../../src/components/map/MapBottomSheet';
import { AddPlaceLocationModal } from '../../../src/components/map/AddPlaceLocationModal';
import { PlaceDetailModal } from '../../../src/components/map/PlaceDetailModal';
import { PlaceGalleryModal } from '../../../src/components/map/PlaceGalleryModal';
import { DEMO_MAP_PLACES } from '../../../src/components/map/map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../../src/features/places/groupMapPlaces';
import { AndreaMapPlace } from '../../../src/types/map';
import { IconPlus, IconLocateFixed } from '../../../src/components/ui/Icons';
import { StorageEngine } from '../../../src/services/storage';
import { CloudSyncEngine } from '../../../src/services/cloud-sync/CloudSyncEngine';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [activeDetailPlace, setActiveDetailPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v6', DEMO_MAP_PLACES);
      let currentBase = DEMO_MAP_PLACES;
      if (saved && saved.length > 0) {
        const milestoneIds = DEMO_MAP_PLACES.map((p) => p.id);
        const userAddedPlaces = saved.filter((p) => !milestoneIds.includes(p.id));
        currentBase = [...DEMO_MAP_PLACES, ...userAddedPlaces];
      }
      setAllPlaces(currentBase);
      setIsLoaded(true);

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
              photos: mp.photos || (mp.imageUrl ? [mp.imageUrl] : []),
              city: mp.cityName || mp.city,
              formattedAddress: mp.subtitle,
              source: 'google_places',
              verifiedByUser: true,
            }));

            setAllPlaces((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              cloudPlaces.forEach((cp) => map.set(cp.id, cp));
              return Array.from(map.values());
            });
          }
        } catch (e) {
          console.warn('[Map] Cloud hydration error:', e);
        }
      }
    }

    loadPlaces();

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
              photos: payload.photos || (payload.imageUrl ? [payload.imageUrl] : []),
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
    StorageEngine.setItem('andrea_map_places_v6', allPlaces);
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
      stages: allPlaces.filter((p) => FILTER_TYPE_MAP.stages.includes(p.type)).length,
      memories: allPlaces.filter((p) => FILTER_TYPE_MAP.memories.includes(p.type)).length,
      dates: allPlaces.filter((p) => FILTER_TYPE_MAP.dates.includes(p.type)).length,
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
    setActiveDetailPlace(place);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenGallery = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setActiveDetailPlace(place);
    setIsGalleryModalOpen(true);
  }, []);

  const handleAddPhotoToPlace = useCallback((placeId: string, newPhotoUrl: string) => {
    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPhotos = Array.from(new Set([...(place.photos || []), newPhotoUrl]));
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: place.imageUrl || newPhotoUrl,
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setEditingPlace(null);
    setIsAddModalOpen(true);
  };

  const handleEditLocation = (place: AndreaMapPlace) => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
    setIsDetailModalOpen(false);
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
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        selectedGroupId={selectedGroupId}
        onPlacePress={handlePlacePress}
        onGroupPress={handleGroupPress}
      />

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

      <MapBottomSheet
        place={selectedPlace}
        group={selectedGroup}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
        onOpenGallery={handleOpenGallery}
        onSelectPlaceFromGroup={handleSelectPlaceFromGroup}
      />

      <PlaceDetailModal
        visible={isDetailModalOpen}
        place={activeDetailPlace}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenGallery={handleOpenGallery}
        onEditPlace={handleEditLocation}
      />

      <PlaceGalleryModal
        visible={isGalleryModalOpen}
        place={activeDetailPlace}
        onClose={() => setIsGalleryModalOpen(false)}
        onAddPhoto={handleAddPhotoToPlace}
      />

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
