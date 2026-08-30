import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Radii, Spacing } from '../../theme/tokens';
import { MapPlaceType } from '../../types/map';
import { IconSearch } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';

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
  onSearchPress?: () => void;
}

export function MapFilters({
  activeFilter,
  onFilterChange,
  counts,
  onSearchPress,
}: MapFiltersProps) {
  const filters: { key: MapFilterKey; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'memories', label: 'Recuerdos' },
    { key: 'restaurants', label: 'Lugares' },
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
              activeOpacity={0.75}
              onPress={() => {
                triggerHaptic('selection');
                onFilterChange(f.key);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
            >
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

        {onSearchPress && (
          <TouchableOpacity
            style={styles.searchIconButton}
            activeOpacity={0.75}
            onPress={() => {
              triggerHaptic('light');
              onSearchPress();
            }}
            accessibilityLabel="Buscar en el atlas"
          >
            <IconSearch size={16} color="rgba(255, 248, 242, 0.85)" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 20, 38, 0.78)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.10)',
    gap: 5,
  },
  chipActive: {
    backgroundColor: '#E05666',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#E05666',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: 'rgba(255, 248, 242, 0.78)',
  },
  chipTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  countText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: 'rgba(255, 248, 242, 0.65)',
  },
  countTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 20, 38, 0.78)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
