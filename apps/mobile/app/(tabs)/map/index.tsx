import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
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
import { Radii, Spacing, Typography } from '../../../src/theme/tokens';
import { IconPlus, IconMapPin } from '../../../src/components/ui/Icons';
import { StorageEngine } from '../../../src/services/storage';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Dynamic places state with local persistence
  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add / Edit Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v4', DEMO_MAP_PLACES);
      if (saved && saved.length > 0) {
        // Guarantee latest authentic milestones are always synced while keeping user-added pins
        const milestoneIds = DEMO_MAP_PLACES.map((p) => p.id);
        const userAddedPlaces = saved.filter((p) => !milestoneIds.includes(p.id));
        setAllPlaces([...DEMO_MAP_PLACES, ...userAddedPlaces]);
      } else {
        setAllPlaces(DEMO_MAP_PLACES);
      }
      setIsLoaded(true);
    }
    loadPlaces();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem('andrea_map_places_v4', allPlaces);
  }, [allPlaces, isLoaded]);

  // Filtered places based on active chip
  const filteredPlaces = useMemo(() => {
    const filterTypes = FILTER_TYPE_MAP[activeFilter];
    if (filterTypes === 'all') return allPlaces;
    return allPlaces.filter((p) => filterTypes.includes(p.type));
  }, [allPlaces, activeFilter]);

  // Groups for current filtered places
  const currentGroups = useMemo(() => {
    return groupMapPlaces(filteredPlaces);
  }, [filteredPlaces]);

  // Selected place for bottom sheet
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return allPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [allPlaces, selectedPlaceId]);

  // Selected group for bottom sheet
  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return currentGroups.find((g) => g.id === selectedGroupId) || null;
  }, [currentGroups, selectedGroupId]);

  // Filter counts
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
    Alert.alert(
      place.title,
      `${place.subtitle || place.formattedAddress || ''}\n\n${place.description || 'Sin descripción adicional.'}`
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
  };

  const handleRecenter = () => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  };

  const topOffset = Math.max(insets.top + 8, 14);

  return (
    <View style={styles.container}>
      {/* 1. Cross-Platform Mapbox Map (Apple Maps Midnight Aesthetic) with Clustering */}
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        selectedGroupId={selectedGroupId}
        onPlacePress={handlePlacePress}
        onGroupPress={handleGroupPress}
        onAddPlacePress={handleOpenAddModal}
      />

      {/* 2. Top Centered Apple Maps Header Title */}
      <View style={[styles.topHeader, { top: topOffset }]} pointerEvents="box-none">
        <Text style={styles.headerTitle}>Nuestra Historia</Text>
      </View>

      {/* 3. Top-Right Floating iOS Glass HUD Controls (Under Global Profile Avatar) */}
      <View style={[styles.hudControls, { top: topOffset + 50 }]} pointerEvents="box-none">
        {/* Close / Reset Selection */}
        {selectedPlaceId || selectedGroupId ? (
          <TouchableOpacity
            style={styles.hudButton}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('light');
              setSelectedPlaceId(null);
              setSelectedGroupId(null);
            }}
          >
            <Text style={styles.hudButtonText}>✕</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.hudButton}
            activeOpacity={0.8}
            onPress={handleOpenAddModal}
          >
            <IconPlus size={16} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        )}

        {/* Toggle Filter Chips */}
        <TouchableOpacity
          style={[styles.hudButton, showFilters && styles.hudButtonActive]}
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic('light');
            setShowFilters(!showFilters);
          }}
        >
          <View style={styles.layersIconStack}>
            <View style={styles.layersBar} />
            <View style={[styles.layersBar, { width: 10 }]} />
            <View style={styles.layersBar} />
          </View>
        </TouchableOpacity>

        {/* Recenter Navigation Pointer */}
        <TouchableOpacity
          style={styles.hudButton}
          activeOpacity={0.8}
          onPress={handleRecenter}
        >
          <IconMapPin size={17} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 4. Filter Chips Strip */}
      {showFilters && (
        <View style={[styles.filtersContainer, { top: topOffset + 48 }]} pointerEvents="box-none">
          <MapFilters
            activeFilter={activeFilter}
            onFilterChange={(f) => {
              triggerHaptic('selection');
              setActiveFilter(f);
            }}
            counts={filterCounts}
          />
        </View>
      )}

      {/* 5. Place Detail / Group Bottom Sheet */}
      <MapBottomSheet
        place={selectedPlace}
        group={selectedGroup}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
        onSelectPlaceFromGroup={handleSelectPlaceFromGroup}
      />

      {/* 6. Real Mapbox Geocoding & Visual Pin Confirmation Modal */}
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
    width: '100%',
    height: '100%',
    backgroundColor: '#030C1E',
    position: 'relative',
  },
  topHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    backgroundColor: 'rgba(3, 12, 30, 0.72)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  hudControls: {
    position: 'absolute',
    right: 14,
    zIndex: 95,
    gap: 10,
    alignItems: 'center',
  },
  hudButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(8, 18, 36, 0.78)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(25px) saturate(180%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%)',
        } as any)
      : {}),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  hudButtonActive: {
    backgroundColor: 'rgba(224, 86, 102, 0.35)',
    borderColor: '#E05666',
  },
  hudButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  layersIconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  layersBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    position: 'absolute',
    left: 14,
    right: 60,
    zIndex: 90,
  },
});
