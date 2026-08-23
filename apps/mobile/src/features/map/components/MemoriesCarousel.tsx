import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPlace } from '@andrea/types';
import { formatDateShort, getCountryFlag } from '../utils/formatters';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface MemoriesCarouselProps {
  visible: boolean;
  places: MapPlace[];
  selectedPlaceId: string | null;
  onSelectPlaceId: (id: string) => void;
  onClose: () => void;
}

export function MemoriesCarousel({
  visible,
  places,
  selectedPlaceId,
  onSelectPlaceId,
  onClose,
}: MemoriesCarouselProps) {
  const insets = useSafeAreaInsets();
  if (!visible || places.length === 0) return null;

  const bottomOffset = Math.max(insets.bottom + 12, 16);

  return (
    <View style={[styles.floatingContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.headerBar} pointerEvents="box-none">
        <Text style={styles.headerTitle}>Explorando recuerdos ({places.length})</Text>
        <TouchableOpacity
          style={styles.closeTouchArea}
          onPress={() => {
            triggerHaptic('light');
            onClose();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Cerrar carrusel"
        >
          <View style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Cerrar ✕</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={200}
        decelerationRate="fast"
      >
        {places.map((place) => {
          const isSelected = place.id === selectedPlaceId;
          const flag = getCountryFlag(place.country);
          const photoUrl = place.photos?.[0];

          return (
            <TouchableOpacity
              key={place.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => {
                triggerHaptic('selection');
                onSelectPlaceId(place.id);
              }}
              activeOpacity={0.85}
            >
              {/* Vertical Photo 4:5 */}
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.cardPhoto} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={{ fontSize: 32 }}>{flag}</Text>
                </View>
              )}

              {/* Memory Text Overlay */}
              <View style={styles.cardOverlay}>
                <Text style={styles.cardLocation}>{flag} {place.cityName}</Text>
                <Text style={styles.cardTitle} numberOfLines={1}>{place.title}</Text>
                <Text style={styles.cardDate}>{formatDateShort(place.date)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    ...Typography.captionBold,
    color: '#1E252B',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(16px)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    fontSize: 11.5,
  },
  closeTouchArea: {
    height: 44,
    justifyContent: 'center',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(16px)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  closeBtnText: {
    ...Typography.captionBold,
    fontSize: 11,
    color: '#E86A58',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    width: 180,
    height: 225,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    ...Shadows.lg,
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#E86A58',
    borderWidth: 2.5,
    transform: [{ translateY: -4 }],
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: 'rgba(20, 27, 32, 0.75)',
    backdropFilter: 'blur(10px)',
  },
  cardLocation: {
    ...Typography.captionBold,
    fontSize: 10.5,
    color: '#FFB8A8',
    marginBottom: 1,
  },
  cardTitle: {
    ...Typography.bodyMedium,
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 1,
  },
  cardDate: {
    ...Typography.caption,
    fontSize: 9.5,
    color: '#EAE5E8',
  },
});
