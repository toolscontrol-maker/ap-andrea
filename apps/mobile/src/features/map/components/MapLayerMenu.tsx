import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MapViewportMode } from '../domain/map.types';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface MapLayerMenuProps {
  visible: boolean;
  onClose: () => void;
  currentMode: MapViewportMode;
  onSelectMode: (mode: MapViewportMode) => void;
}

const LAYERS = [
  { id: 'standard', label: 'Estándar', sub: 'Cartografía vectorial limpia estilo Apple', icon: '🗺️' },
  { id: 'satellite', label: 'Satélite', sub: 'Fotografía aérea real en alta definición', icon: '🛰️' },
  { id: 'globe3d', label: 'Globo 3D', sub: 'Planeta Tierra esférico giratorio en el espacio', icon: '🌍' },
] as const;

export function MapLayerMenu({
  visible,
  onClose,
  currentMode,
  onSelectMode,
}: MapLayerMenuProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.menuContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />
          <Text style={styles.menuTitle}>Vista del Mapa</Text>

          <View style={styles.optionsList}>
            {LAYERS.map((layer) => {
              const isSelected = currentMode === layer.id;
              return (
                <TouchableOpacity
                  key={layer.id}
                  style={[styles.layerOption, isSelected && styles.layerOptionActive]}
                  onPress={() => {
                    onSelectMode(layer.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.layerIcon}>{layer.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.layerLabel, isSelected && styles.layerLabelActive]}>
                      {layer.label}
                    </Text>
                    <Text style={styles.layerSub}>{layer.sub}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  menuTitle: {
    ...Typography.h3,
    fontSize: 18,
    color: '#1E252B',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  optionsList: {
    gap: Spacing.sm,
  },
  layerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.xl,
    backgroundColor: '#FAF6F0',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  layerOptionActive: {
    backgroundColor: '#FDEEEB',
    borderColor: '#E86A58',
  },
  layerIcon: {
    fontSize: 24,
  },
  layerLabel: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: '#1E252B',
  },
  layerLabelActive: {
    color: '#E86A58',
    fontWeight: '800',
  },
  layerSub: {
    ...Typography.caption,
    fontSize: 11,
    color: '#66737C',
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E86A58',
  },
});
