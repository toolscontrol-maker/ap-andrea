import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { MapExplorationMode } from '@andrea/types';
import { triggerHaptic } from '../../utils/haptics';

export type MapFilterKey = string;

export interface SubFilterOption {
  key: string;
  label: string;
  icon: string;
}

export const MODE_FILTERS: Record<MapExplorationMode, SubFilterOption[]> = {
  places: [
    { key: 'all', label: 'Todo', icon: '✦' },
    { key: 'food', label: 'Comer y Beber', icon: '🍽️' },
    { key: 'stay', label: 'Alojarse', icon: '🏨' },
    { key: 'home', label: 'Hogares', icon: '🏡' },
    { key: 'nature', label: 'Naturaleza', icon: '🌿' },
    { key: 'shop', label: 'Tiendas & Rincones', icon: '🛍️' },
  ],
  moments: [
    { key: 'all', label: 'Todo', icon: '✦' },
    { key: 'memories', label: 'Recuerdos', icon: '❤️' },
    { key: 'dates', label: 'Citas', icon: '🥂' },
    { key: 'trips', label: 'Viajes', icon: '✈️' },
    { key: 'surprises', label: 'Sorpresas', icon: '🎁' },
  ],
  chapters: [
    { key: 'all', label: 'Todo', icon: '✦' },
    { key: 'home', label: 'Hogares', icon: '🏡' },
    { key: 'life_stage', label: 'Etapas', icon: '📖' },
    { key: 'city', label: 'Ciudades', icon: '🏙️' },
  ],
};

interface MapFiltersProps {
  mode: MapExplorationMode;
  onModeChange: (mode: MapExplorationMode) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts?: Record<string, number>;
  topOffset?: number;
}

export function MapFilters({
  mode,
  onModeChange,
  activeFilter,
  onFilterChange,
  counts,
  topOffset = 12,
}: MapFiltersProps) {
  const subFilters = MODE_FILTERS[mode] || MODE_FILTERS.places;

  return (
    <View style={[styles.container, { top: topOffset }]}>
      {/* Tier 1: Exploration Mode Segmented Switcher */}
      <View style={styles.modeSwitcherCard}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'places' && styles.modeTabActive]}
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic('selection');
            onModeChange('places');
            onFilterChange('all');
          }}
        >
          <Text style={[styles.modeTabText, mode === 'places' && styles.modeTabTextActive]}>
            📍 Lugares
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'moments' && styles.modeTabActive]}
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic('selection');
            onModeChange('moments');
            onFilterChange('all');
          }}
        >
          <Text style={[styles.modeTabText, mode === 'moments' && styles.modeTabTextActive]}>
            ❤️ Momentos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'chapters' && styles.modeTabActive]}
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic('selection');
            onModeChange('chapters');
            onFilterChange('all');
          }}
        >
          <Text style={[styles.modeTabText, mode === 'chapters' && styles.modeTabTextActive]}>
            🏡 Capítulos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tier 2: Horizontal Scrollable Sub-filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {subFilters.map((f) => {
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
    alignItems: 'center',
    gap: 8,
  },
  modeSwitcherCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    padding: 3,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modeTab: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 18,
  },
  modeTabActive: {
    backgroundColor: '#3A2F38',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#766B72',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chipActive: {
    backgroundColor: '#EF826A',
    borderColor: '#EF826A',
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A2F38',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: '#F0ECE8',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#766B72',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});
