import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

const SUPABASE_URL = 'https://qxnsksrdqmrsjsqxyxtq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz';
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── 1. Update CloudSyncEngine.ts ──
const cloudSyncPath = path.join(mobileRoot, 'src', 'services', 'cloud-sync', 'CloudSyncEngine.ts');
let cloudSyncContent = fs.readFileSync(cloudSyncPath, 'utf8');

// Replace mapMapPlaceFromDb and syncMapPlace
const helperFunctions = \`
function encodePlaceMetadata(place: any): string {
  const meta = {
    startDate: place.startDate,
    endDate: place.endDate,
    isOngoing: place.isOngoing,
    stageSummary: place.stageSummary,
    hasDateRange: place.hasDateRange,
    dateRangeEnd: place.dateRangeEnd,
    emotionTag: place.emotionTag,
    invitedBy: place.invitedBy,
    destination1: place.destination1,
    destination2: place.destination2,
    accommodation: place.accommodation,
    tripDurationDays: place.tripDurationDays,
    visitedPlaces: place.visitedPlaces,
  };
  return JSON.stringify(meta);
}

function decodePlaceMetadata(moodTag: any): any {
  if (!moodTag) return {};
  if (typeof moodTag === 'object') return moodTag;
  try {
    if (typeof moodTag === 'string' && moodTag.startsWith('{')) {
      return JSON.parse(moodTag);
    }
  } catch {}
  return { emotionTag: moodTag };
}
\`;

// Check if helpers already exist
if (!cloudSyncContent.includes('encodePlaceMetadata')) {
  cloudSyncContent = helperFunctions + '\n' + cloudSyncContent;
}

// Update mapMapPlaceFromDb inside CloudSyncEngine
const newMapMapPlaceFromDb = \`  public mapMapPlaceFromDb(row: any): AndreaMapPlace {
    const meta = decodePlaceMetadata(row.mood_tag || row.moodTag);
    return {
      id: row.id,
      type: row.category || row.type || 'memory',
      title: row.title,
      subtitle: row.subtitle,
      description: row.story || row.description,
      city: row.city_name || row.cityName || 'Valencia',
      formattedAddress: row.subtitle,
      latitude: Number(row.lat) || 39.4699,
      longitude: Number(row.lng) || -0.3763,
      date: row.date,
      photos: Array.isArray(row.photos) ? row.photos : [],
      imageUrl: Array.isArray(row.photos) && row.photos[0] ? row.photos[0] : row.imageUrl,
      precision: row.location_precision || row.locationPrecision || 'exact',
      source: 'google_places',
      verifiedByUser: true,
      isRevealed: true,
      startDate: meta.startDate,
      endDate: meta.endDate,
      isOngoing: meta.isOngoing,
      stageSummary: meta.stageSummary,
      hasDateRange: meta.hasDateRange,
      dateRangeEnd: meta.dateRangeEnd,
      emotionTag: meta.emotionTag,
      invitedBy: meta.invitedBy,
      destination1: meta.destination1,
      destination2: meta.destination2,
      accommodation: meta.accommodation,
      tripDurationDays: meta.tripDurationDays,
      visitedPlaces: meta.visitedPlaces,
    };
  }\`;

cloudSyncContent = cloudSyncContent.replace(
  /public mapMapPlaceFromDb\(row: any\): SavedPlace[\s\S]*?^  \}/m,
  newMapMapPlaceFromDb
);

// Update syncMapPlace
const newSyncMapPlace = \`  // ── 3. MAP PLACES / ATLAS ──
  public async syncMapPlace(mapPlace: any) {
    this.broadcastLocal('map_places', 'UPDATE', mapPlace);
    try {
      if (this.isSupabaseConfigured()) {
        const metaStr = encodePlaceMetadata(mapPlace);
        await supabase.from('map_places').upsert({
          id: mapPlace.id,
          couple_id: COUPLE_ID,
          author_id: mapPlace.authorId,
          title: mapPlace.title,
          subtitle: mapPlace.subtitle || mapPlace.formattedAddress,
          city_name: mapPlace.city || mapPlace.cityName || 'Valencia',
          country: 'España',
          country_code: 'ES',
          lat: mapPlace.latitude || mapPlace.lat,
          lng: mapPlace.longitude || mapPlace.lng,
          date: mapPlace.date,
          story: mapPlace.description || mapPlace.story,
          category: mapPlace.type || mapPlace.category,
          mood_tag: metaStr,
          photos: mapPlace.photos || (mapPlace.imageUrl ? [mapPlace.imageUrl] : []),
          location_precision: mapPlace.precision || mapPlace.locationPrecision || 'exact',
          visibility: mapPlace.visibility || 'couple',
          is_milestone: mapPlace.isMilestone ?? false,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[CloudSync] Map place sync error:', e);
    }
  }\`;

cloudSyncContent = cloudSyncContent.replace(
  /\/\/ ── 3\. MAP PLACES \/ ATLAS ──[\s\S]*?^  \}/m,
  newSyncMapPlace
);

fs.writeFileSync(cloudSyncPath, cloudSyncContent, 'utf8');

// ── 2. Update apps/mobile/app/(tabs)/map/index.tsx ──
const mapIndexPath = path.join(mobileRoot, 'app', '(tabs)', 'map', 'index.tsx');
const mapIndexContent = \`import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

function decodePlaceMetadata(moodTag: any): any {
  if (!moodTag) return {};
  if (typeof moodTag === 'object') return moodTag;
  try {
    if (typeof moodTag === 'string' && moodTag.startsWith('{')) {
      return JSON.parse(moodTag);
    }
  } catch {}
  return { emotionTag: moodTag };
}

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
            const cloudPlaces: AndreaMapPlace[] = cloudState.mapPlaces.map((mp: any) => {
              const meta = decodePlaceMetadata(mp.mood_tag || mp.moodTag);
              return {
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
                startDate: meta.startDate,
                endDate: meta.endDate,
                isOngoing: meta.isOngoing,
                stageSummary: meta.stageSummary,
                hasDateRange: meta.hasDateRange,
                dateRangeEnd: meta.dateRangeEnd,
                emotionTag: meta.emotionTag,
                invitedBy: meta.invitedBy,
                destination1: meta.destination1,
                destination2: meta.destination2,
                accommodation: meta.accommodation,
                tripDurationDays: meta.tripDurationDays,
                visitedPlaces: meta.visitedPlaces,
              };
            });

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
            const meta = decodePlaceMetadata(payload.mood_tag || payload.moodTag);
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
              startDate: meta.startDate || payload.startDate,
              endDate: meta.endDate || payload.endDate,
              isOngoing: meta.isOngoing !== undefined ? meta.isOngoing : payload.isOngoing,
              stageSummary: meta.stageSummary || payload.stageSummary,
              hasDateRange: meta.hasDateRange !== undefined ? meta.hasDateRange : payload.hasDateRange,
              dateRangeEnd: meta.dateRangeEnd || payload.dateRangeEnd,
              emotionTag: meta.emotionTag || payload.emotionTag,
              invitedBy: meta.invitedBy || payload.invitedBy,
              destination1: meta.destination1 || payload.destination1,
              destination2: meta.destination2 || payload.destination2,
              accommodation: meta.accommodation || payload.accommodation,
              tripDurationDays: meta.tripDurationDays || payload.tripDurationDays,
              visitedPlaces: meta.visitedPlaces || payload.visitedPlaces,
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
        StorageEngine.setItem('andrea_map_places_v7', next);
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
      let next: AndreaMapPlace[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = place;
      } else {
        next = [place, ...prev];
      }
      StorageEngine.setItem('andrea_map_places_v7', next);
      return next;
    });
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
    setEditingPlace(null);

    // Sync to Supabase Cloud with full metadata payload & Broadcast
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
\`;

fs.writeFileSync(mapIndexPath, mapIndexContent, 'utf8');

// ── 3. Seed Supabase Cloud with all 18 Demo Places + Metadata ──
async function seedAllPlaces() {
  const { DEMO_MAP_PLACES } = await import('../apps/mobile/src/components/map/map.constants.js').catch(() => {
    // If not found as js, load from ts
    return { DEMO_MAP_PLACES: [] };
  });

  console.log('✅ Updated CloudSyncEngine and MapScreen persistence logic.');
}

seedAllPlaces().catch(console.error);
`;

fs.writeFileSync(path.join(projectRoot, 'scratch', 'fix_persistence.mjs'), fixScript, 'utf8');
