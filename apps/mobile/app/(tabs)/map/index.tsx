import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AndreaMap } from '../../../src/components/map/AndreaMap';
import { MapFilters, MapFilterKey, FILTER_TYPE_MAP } from '../../../src/components/map/MapFilters';
import { MapBottomSheet } from '../../../src/components/map/MapBottomSheet';
import { DEMO_MAP_PLACES, DEFAULT_MAP_CAMERA } from '../../../src/components/map/map.constants';
import { AndreaMapPlace, MapBounds } from '../../../src/types/map';
import { Radii, Spacing, Typography } from '../../../src/theme/tokens';
import { IconPlus, IconMapPin } from '../../../src/components/ui/Icons';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const allPlaces: AndreaMapPlace[] = DEMO_MAP_PLACES;

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
      `${place.subtitle || ''}\n\n${place.description || 'Sin descripción adicional.'}`
    );
  }, []);

  const handleAddPlacePress = () => {
    triggerHaptic('light');
    Alert.alert(
      'Añadir Nuevo Rincón',
      'Elige si deseas guardar un Recuerdo vivido, un Restaurante pendiente o un Viaje soñado.'
    );
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
        onAddPlacePress={handleAddPlacePress}
      />

      {/* 2. Top Centered Apple Maps Header Title */}
      <View style={[styles.topHeader, { top: topOffset }]} pointerEvents="box-none">
        <Text style={styles.headerTitle}>Nuestra Historia</Text>
      </View>

      {/* 3. Top-Right Floating iOS Glass HUD Controls */}
      <View style={[styles.hudControls, { top: topOffset }]} pointerEvents="box-none">
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
            onPress={handleAddPlacePress}
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

      {/* 5. Place Detail Bottom Sheet */}
      <MapBottomSheet
        place={selectedPlace}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
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
});
