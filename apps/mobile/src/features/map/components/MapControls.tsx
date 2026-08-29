import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing } from '../../../theme/tokens';

interface MapControlsProps {
  is3dPitch: boolean;
  onTogglePitch: () => void;
  onFitAll: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isCarouselOpen: boolean;
  onToggleCarousel: () => void;
  isTimelineOpen: boolean;
  onToggleTimeline: () => void;
  isGlobeMode: boolean;
}

export function MapControls({
  is3dPitch,
  onTogglePitch,
  onFitAll,
  onZoomIn,
  onZoomOut,
  isCarouselOpen,
  onToggleCarousel,
  isTimelineOpen,
  onToggleTimeline,
  isGlobeMode,
}: MapControlsProps) {
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top + 68, 76);

  return (
    <View style={[styles.floatingContainer, { top: topOffset }]} pointerEvents="box-none">
      {/* 3D / 2D Pitch (44x44 touch target) */}
      {!isGlobeMode && (
        <TouchableOpacity
          style={styles.touchTarget}
          onPress={() => {
            triggerHaptic('selection');
            onTogglePitch();
          }}
          activeOpacity={0.7}
          accessibilityLabel="Alternar vista 3D"
        >
          <View style={[styles.btnCircle, is3dPitch && styles.btnCircleActive]}>
            <Text style={[styles.btnText, is3dPitch && styles.btnTextActive]}>
              {is3dPitch ? '3D' : '2D'}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Fit Bounds / Compass (44x44 touch target) */}
      <TouchableOpacity
        style={styles.touchTarget}
        onPress={() => {
          triggerHaptic('light');
          onFitAll();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Encuadrar todos los recuerdos"
      >
        <View style={styles.btnCircle}>
          <Text style={styles.btnIcon}>🧭</Text>
        </View>
      </TouchableOpacity>

      {/* Floating Zoom In (+) (44x44 touch target) */}
      <TouchableOpacity
        style={styles.touchTarget}
        onPress={() => {
          triggerHaptic('light');
          onZoomIn();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Acercar mapa"
      >
        <View style={styles.btnCircle}>
          <Text style={styles.btnIconBold}>+</Text>
        </View>
      </TouchableOpacity>

      {/* Floating Zoom Out (−) (44x44 touch target) */}
      <TouchableOpacity
        style={styles.touchTarget}
        onPress={() => {
          triggerHaptic('light');
          onZoomOut();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Alejar mapa"
      >
        <View style={styles.btnCircle}>
          <Text style={styles.btnIconBold}>−</Text>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.btnDivider} />

      {/* Toggle Memories Carousel (44x44 touch target) */}
      <TouchableOpacity
        style={styles.touchTarget}
        onPress={() => {
          triggerHaptic('medium');
          onToggleCarousel();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Abrir carrusel de recuerdos"
      >
        <View style={[styles.btnCircle, isCarouselOpen && styles.btnCircleActive]}>
          <Text style={styles.btnIcon}>📸</Text>
        </View>
      </TouchableOpacity>

      {/* Toggle Timeline Scrubber (44x44 touch target) */}
      <TouchableOpacity
        style={styles.touchTarget}
        onPress={() => {
          triggerHaptic('medium');
          onToggleTimeline();
        }}
        activeOpacity={0.7}
        accessibilityLabel="Abrir cronología"
      >
        <View style={[styles.btnCircle, isTimelineOpen && styles.btnCircleActive]}>
          <Text style={styles.btnIcon}>⏳</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    right: Spacing.xs,
    zIndex: 15,
    gap: 2,
    alignItems: 'center',
  },
  touchTarget: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCircle: {
    width: 38,
    height: 38,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    ...Shadows.sm,
  },
  btnCircleActive: {
    backgroundColor: '#1E252B',
    borderColor: '#1E252B',
  },
  btnIcon: {
    fontSize: 15,
  },
  btnIconBold: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E252B',
    marginTop: -2,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E252B',
  },
  btnTextActive: {
    color: '#FFFFFF',
  },
  btnDivider: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    marginVertical: 2,
  },
});
