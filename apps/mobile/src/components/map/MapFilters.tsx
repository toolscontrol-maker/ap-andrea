import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Radii, Shadows, Spacing } from '../../theme/tokens';
import { MapPlaceType } from '../../types/map';

export type MapFilterKey = 'all' | 'memories' | 'restaurants' | 'trips' | 'dreams';

export const FILTER_TYPE_MAP: Record<MapFilterKey, MapPlaceType[] | 'all'> = {
  all: 'all',
  memories: ['memory', 'important_date'],
  restaurants: ['restaurant'],
  trips: ['trip'],
  dreams: ['future_place', 'surprise'],
};

interface MapFiltersProps {
  activeFilter: MapFilterKey;
  onFilterChange: (filter: MapFilterKey) => void;
  counts?: Record<MapFilterKey, number>;
}

export function MapFilters({ activeFilter, onFilterChange, counts }: MapFiltersProps) {
  const filters: { key: MapFilterKey; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'memories', label: 'Recuerdos' },
    { key: 'restaurants', label: 'Restaurantes' },
    { key: 'trips', label: 'Viajes' },
    { key: 'dreams', label: 'Sueños' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const count = counts ? counts[f.key] : undefined;

          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => onFilterChange(f.key)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {f.label}
                {count !== undefined && count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(12, 24, 48, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...Shadows.sm,
  },
  chipActive: {
    backgroundColor: '#38B6FF',
    borderColor: '#FFFFFF',
    shadowColor: '#38B6FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  chipTextActive: {
    color: '#030C1E',
    fontWeight: '800',
  },
});
