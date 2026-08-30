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
      // 1. Load locally saved places (user edits override base constants)
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v7', null);
      let currentBase = DEMO_MAP_PLACES;
      if (saved && saved.length > 0) {
        const placeMap = new Map(DEMO_MAP_PLACES.map((p) => [p.id, p]));
        saved.forEach((sp) => placeMap.set(sp.id, sp));
        currentBase = Array.from(placeMap.values());
      }
      setAllPlaces(currentBase);
      setIsLoaded(true);

      // 2. Fetch full Supabase Cloud State with rich fields decoded
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
              city: mp.cityName || mp.city || 'Valencia',
              formattedAddress: mp.subtitle,
              source: 'google_places',
              verifiedByUser: true,
              startDate: mp.startDate,
              endDate: mp.endDate,
              isOngoing: mp.isOngoing,
              stageSummary: mp.stageSummary,
              hasDateRange: mp.hasDateRange,
              dateRangeEnd: mp.dateRangeEnd,
              emotionTag: mp.emotionTag,
              invitedBy: mp.invitedBy,
              destination1: mp.destination1,
              destination2: mp.destination2,
              accommodation: mp.accommodation,
              tripDurationDays: mp.tripDurationDays,
              visitedPlaces: mp.visitedPlaces,
            }));

            setAllPlaces((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              cloudPlaces.forEach((cp) => map.set(cp.id, cp));
              const merged = Array.from(map.values());
              StorageEngine.setItem('andrea_map_places_v7', merged);
              return merged;
            });
          }
        } catch (e) {
          console.warn('[Map] Cloud hydration error:', e);
        }
      }
    }

    loadPlaces();

    // 3. Realtime Supabase & Broadcast Subscription
    const unsubscribe = CloudSyncEngine.subscribe({
      onEntityChange: (entity, eventType, payload) => {
        if (entity === 'map_places') {
          if (eventType === 'DELETE') {
            setAllPlaces((prev) => {
              const next = prev.filter((p) => p.id !== payload.id);
              StorageEngine.setItem('andrea_map_places_v7', next);
              return next;
            });
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
              city: payload.cityName || payload.city || 'Valencia',
              formattedAddress: payload.subtitle,
              source: 'google_places',
              verifiedByUser: true,
              startDate: payload.startDate,
              endDate: payload.endDate,
              isOngoing: payload.isOngoing,
              stageSummary: payload.stageSummary,
              hasDateRange: payload.hasDateRange,
              dateRangeEnd: payload.dateRangeEnd,
              emotionTag: payload.emotionTag,
              invitedBy: payload.invitedBy,
              destination1: payload.destination1,
              destination2: payload.destination2,
              accommodation: payload.accommodation,
              tripDurationDays: payload.tripDurationDays,
              visitedPlaces: payload.visitedPlaces,
            };

            setAllPlaces((prev) => {
              const idx = prev.findIndex((p) => p.id === updatedPlace.id);
              let next: AndreaMapPlace[];
              if (idx >= 0) {
                next = [...prev];
                next[idx] = updatedPlace;
              } else {
                next = [updatedPlace, ...prev];
              }
              StorageEngine.setItem('andrea_map_places_v7', next);
              return next;
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
    StorageEngine.setItem('andrea_map_places_v7', allPlaces);
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

  const handleAddPhotoToPlace = useCallback(async (placeId: string, newPhotoUrl: string) => {
    let finalPhotoUrl = newPhotoUrl;
    if (newPhotoUrl && (newPhotoUrl.startsWith('data:') || newPhotoUrl.startsWith('blob:'))) {
      try {
        finalPhotoUrl = await CloudSyncEngine.uploadMediaImage(newPhotoUrl, `map_photo_${placeId}_${Date.now()}.jpg`);
      } catch (e) {
        console.warn('[Map] Error uploading gallery photo:', e);
      }
    }

    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPhotos = Array.from(new Set([...(place.photos || []), finalPhotoUrl]));
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: place.imageUrl || finalPhotoUrl,
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        StorageEngine.setItem('andrea_map_places_v7', next);
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleAddMultiplePhotosToPlace = useCallback(async (placeId: string, newPhotoUrls: string[]) => {
    if (!newPhotoUrls || newPhotoUrls.length === 0) return;

    const uploadedUrls = await Promise.all(
      newPhotoUrls.map(async (url, i) => {
        if (url && (url.startsWith('data:') || url.startsWith('blob:'))) {
          try {
            const isVid = url.includes('video');
            const ext = isVid ? 'mp4' : (url.includes('webp') ? 'webp' : 'jpg');
            return await CloudSyncEngine.uploadMediaImage(url, `map_media_${placeId}_${Date.now()}_${i}.${ext}`);
          } catch (e) {
            console.warn('[Map] Error uploading multi-photo:', e);
            return url;
          }
        }
        return url;
      })
    );

    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPhotos = Array.from(new Set([...(place.photos || []), ...uploadedUrls])).filter(Boolean);
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: place.imageUrl || updatedPhotos[0],
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        StorageEngine.setItem('andrea_map_places_v7', next);
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleReorderPlacePhotos = useCallback((placeId: string, updatedPhotos: string[]) => {
    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: updatedPhotos[0] || undefined,
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        StorageEngine.setItem('andrea_map_places_v7', next);
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleRemovePhotoFromPlace = useCallback((placeId: string, photoUrlToRemove: string) => {
    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPhotos = (place.photos || []).filter((p) => p !== photoUrlToRemove);
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: updatedPhotos.length > 0 ? updatedPhotos[0] : undefined,
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        StorageEngine.setItem('andrea_map_places_v7', next);
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleDeletePlace = useCallback(async (placeId: string) => {
    triggerHaptic('success');
    setAllPlaces((prev) => {
      const next = prev.filter((p) => p.id !== placeId);
      StorageEngine.setItem('andrea_map_places_v7', next);
      return next;
    });
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
    setActiveDetailPlace(null);
    setIsDetailModalOpen(false);
    setIsGalleryModalOpen(false);
    await CloudSyncEngine.deleteMapPlace(placeId);
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
    setIsDetailModalOpen(false);
    setEditingPlace(place);
    setIsAddModalOpen(true);
  };

  const handleSaveVerifiedPlace = async (place: AndreaMapPlace) => {
    let updatedPlace = { ...place };
    if (place.imageUrl && (place.imageUrl.startsWith('data:') || place.imageUrl.startsWith('blob:'))) {
      try {
        const uploaded = await CloudSyncEngine.uploadMediaImage(place.imageUrl, `map_cover_${place.id}_${Date.now()}.jpg`);
        updatedPlace.imageUrl = uploaded;
        updatedPlace.photos = Array.from(new Set([uploaded, ...(place.photos?.filter(p => !p.startsWith('data:') && !p.startsWith('blob:')) || [])]));
      } catch (e) {
        console.warn('[Map] Error uploading cover photo:', e);
      }
    }

    setAllPlaces((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === updatedPlace.id);
      let next: AndreaMapPlace[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = updatedPlace;
      } else {
        next = [updatedPlace, ...prev];
      }
      StorageEngine.setItem('andrea_map_places_v7', next);
      return next;
    });
    setSelectedGroupId(null);
    setSelectedPlaceId(updatedPlace.id);
    setEditingPlace(null);
    await CloudSyncEngine.syncMapPlace(updatedPlace);
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
        onDeletePlace={handleDeletePlace}
      />

      <PlaceGalleryModal
        visible={isGalleryModalOpen}
        place={activeDetailPlace}
        onClose={() => setIsGalleryModalOpen(false)}
        onAddPhoto={handleAddPhotoToPlace}
        onAddMultiplePhotos={handleAddMultiplePhotosToPlace}
        onRemovePhoto={handleRemovePhotoFromPlace}
        onReorderPhotos={handleReorderPlacePhotos}
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
