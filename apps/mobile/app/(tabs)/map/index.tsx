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
  const [showFilters, setShowFilters] = useState<boolean>(true);

  // Dynamic places state with local persistence
  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Add / Edit Place Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v3', DEMO_MAP_PLACES);
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
    StorageEngine.setItem('andrea_map_places_v3', allPlaces);
  }, [allPlaces, isLoaded]);

  // Filtered places based on active chip
  const filteredPlaces = useMemo(() => {
    const filterTypes = FILTER_TYPE_MAP[activeFilter];
    if (filterTypes === 'all') return allPlaces;
    return allPlaces.filter((p) => filterTypes.includes(p.type));
  }, [allPlaces, activeFilter]);

  // Selected place for bottom sheet
  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return allPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [allPlaces, selectedPlaceId]);

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
    setSelectedPlaceId(place.id);
  }, []);

  const handleCloseSheet = useCallback(() => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
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
    setSelectedPlaceId(place.id);
    setEditingPlace(null);
  };

  const handleRecenter = () => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
  };

  const topOffset = Math.max(insets.top + 8, 14);

  return (
    <View style={styles.container}>
      {/* 1. Cross-Platform Mapbox Map (Apple Maps Midnight Aesthetic) */}
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        onPlacePress={handlePlacePress}
        onAddPlacePress={handleOpenAddModal}
      />

      {/* 2. Top Centered Apple Maps Header Title */}
      <View style={[styles.topHeader, { top: topOffset }]} pointerEvents="box-none">
        <Text style={styles.headerTitle}>Nuestra Historia</Text>
      </View>

      {/* 3. Top-Right Floating iOS Glass HUD Controls (Under Global Profile Avatar) */}
      <View style={[styles.hudControls, { top: topOffset + 50 }]} pointerEvents="box-none">
        {/* Close / Reset Selection */}
        {selectedPlaceId ? (
          <TouchableOpacity
            style={styles.hudButton}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('light');
              setSelectedPlaceId(null);
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

      {/* 5. Place Detail Bottom Sheet with Edit/Move Pin support */}
      <MapBottomSheet
        place={selectedPlace}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
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
    ...Typography.h3,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  hudControls: {
    position: 'absolute',
    right: Spacing.md,
    zIndex: 100,
    flexDirection: 'column',
    gap: 10,
  },
  hudButton: {
    width: 42,
    height: 42,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(12, 24, 48, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  hudButtonActive: {
    backgroundColor: 'rgba(56, 182, 255, 0.35)',
    borderColor: '#38B6FF',
  },
  hudButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  filtersContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 95,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(253, 252, 250, 0.90)' : '#FFFFFF',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        } as any)
      : {}),
    borderTopLeftRadius: 4, // Squared corners
    borderTopRightRadius: 4, // Squared corners
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    maxHeight: '85%',
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h2,
    fontSize: 19,
    color: Colors.light.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.textMuted,
  },
  modalBody: {
    maxHeight: 400,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radii.sm,
    backgroundColor: Colors.light.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typePillActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  typePillTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: Spacing.sm,
  },
});
