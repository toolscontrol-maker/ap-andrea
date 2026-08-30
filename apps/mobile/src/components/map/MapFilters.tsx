import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MapPlaceType } from '../../types/map';
import { triggerHaptic } from '../../utils/haptics';

export type MapFilterKey = 'all' | 'stages' | 'memories' | 'dates' | 'restaurants' | 'trips' | 'dreams';

export const FILTER_TYPE_MAP: Record<MapFilterKey, MapPlaceType[] | 'all'> = {
  all: 'all',
  stages: ['stage'],
  memories: ['memory', 'important_date'],
  dates: ['date'],
  restaurants: ['restaurant'],
  trips: ['trip'],
  dreams: ['future_place', 'surprise'],
};

interface MapFiltersProps {
  activeFilter: MapFilterKey;
  onFilterChange: (filter: MapFilterKey) => void;
  counts?: Record<MapFilterKey, number>;
  onSearchPress?: () => void;
  topOffset?: number;
}

export function MapFilters({
  activeFilter,
  onFilterChange,
  counts,
  topOffset = 12,
}: MapFiltersProps) {
  const filters: { key: MapFilterKey; label: string; icon: string }[] = [
    { key: 'all', label: 'Todo', icon: '✦' },
    { key: 'stages', label: 'Etapas', icon: '🏡' },
    { key: 'memories', label: 'Recuerdos', icon: '❤️' },
    { key: 'dates', label: 'Citas', icon: '🥂' },
    { key: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
    { key: 'trips', label: 'Viajes', icon: '✈️' },
    { key: 'dreams', label: 'Sueños', icon: '✨' },
  ];

  return (
    <View style={[styles.container, { top: topOffset }]}>
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
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('selection');
                onFilterChange(f.key);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={styles.chipIcon}>{f.icon}</Text>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {f.label}
              </Text>
              {count !== undefined && count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chipActive: {
    backgroundColor: '#3A2F38',
    borderColor: '#3A2F38',
  },
  chipIcon: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F5EFE8',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
