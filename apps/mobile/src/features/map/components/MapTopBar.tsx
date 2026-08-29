import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapMetrics } from '../domain/map.types';
import { formatDistanceKm } from '../utils/formatters';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface MapTopBarProps {
  metrics: MapMetrics;
  onOpenLayers: () => void;
  onOpenFilters: () => void;
  onAddNewMemory: () => void;
  hasActiveFilters: boolean;
}

export function MapTopBar({
  metrics,
  onOpenLayers,
  onOpenFilters,
  onAddNewMemory,
  hasActiveFilters,
}: MapTopBarProps) {
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top + 8, 16);

  return (
    <View style={[styles.container, { top: topOffset }]} pointerEvents="box-none">
      <View style={styles.card}>
        {/* Left: Minimal Title & Metrics */}
        <View style={styles.titleColumn}>
          <Text style={styles.titleText}>Nuestra historia</Text>
          <Text style={styles.metricsPillText}>
            {metrics.totalMemories} {metrics.totalMemories === 1 ? 'recuerdo' : 'recuerdos'} · {metrics.uniqueCities} {metrics.uniqueCities === 1 ? 'ciudad' : 'ciudades'} {metrics.totalDistanceKm > 0 ? `· ${formatDistanceKm(metrics.totalDistanceKm)}` : ''}
          </Text>
        </View>

        {/* Right: Minimum 44x44pt Touch Target Actions */}
        <View style={styles.actionsRow}>
          {/* Layers Button (44x44) */}
          <TouchableOpacity
            style={styles.touchTarget}
            onPress={() => {
              triggerHaptic('light');
              onOpenLayers();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Cambiar vista del mapa"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🗺️</Text>
            </View>
          </TouchableOpacity>

          {/* Filters Button (44x44) */}
          <TouchableOpacity
            style={styles.touchTarget}
            onPress={() => {
              triggerHaptic('light');
              onOpenFilters();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Filtrar recuerdos"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <View style={[styles.iconCircle, hasActiveFilters && styles.iconCircleActive]}>
              <Text style={styles.iconText}>⚙️</Text>
              {hasActiveFilters && <View style={styles.activeDot} />}
            </View>
          </TouchableOpacity>

          {/* Primary Add Button (44x44) */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              triggerHaptic('medium');
              onAddNewMemory();
            }}
            activeOpacity={0.75}
            accessibilityLabel="Añadir nuevo recuerdo"
          >
            <Text style={styles.addButtonIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 540,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: Radii['2xl'],
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.md,
  },
  titleColumn: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  titleText: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
    fontWeight: '800',
  },
  metricsPillText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#66737C',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  touchTarget: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(43, 33, 41, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconCircleActive: {
    backgroundColor: '#F9DED8',
    borderColor: '#E86A58',
    borderWidth: 1,
  },
  iconText: {
    fontSize: 15,
  },
  activeDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E86A58',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E86A58',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
    marginLeft: 2,
  },
  addButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
});
