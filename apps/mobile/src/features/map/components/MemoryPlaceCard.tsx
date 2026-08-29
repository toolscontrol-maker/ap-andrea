import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPlace } from '@andrea/types';
import { formatDateShort, getCountryFlag } from '../utils/formatters';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Badge } from '../../../components/ui';

interface MemoryPlaceCardProps {
  place: MapPlace | null;
  onOpenDetails: () => void;
  onClose: () => void;
}

export function MemoryPlaceCard({ place, onOpenDetails, onClose }: MemoryPlaceCardProps) {
  const insets = useSafeAreaInsets();
  if (!place) return null;

  const bottomOffset = Math.max(insets.bottom + 12, 16);
  const flag = getCountryFlag(place.country);
  const photoUrl = place.photos?.[0];

  const getCategoryVariant = (cat: string): 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' => {
    switch (cat) {
      case 'viaje': return 'mistBlue';
      case 'cita': return 'primary';
      case 'primer_encuentro': return 'butter';
      default: return 'sage';
    }
  };

  return (
    <View style={[styles.floatingContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          triggerHaptic('medium');
          onOpenDetails();
        }}
        activeOpacity={0.88}
        accessibilityLabel={`Abrir detalles del recuerdo ${place.title}`}
      >
        {/* Left: Photo Thumbnail 72x72 */}
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderEmoji}>{flag}</Text>
          </View>
        )}

        {/* Center: Memory Context Info */}
        <View style={styles.infoColumn}>
          <View style={styles.headerLine}>
            <Badge variant={getCategoryVariant(place.category)} size="sm">
              {place.category === 'viaje' ? '✈️ Viaje' : place.category === 'cita' ? '🍷 Cita' : place.category === 'primer_encuentro' ? '💫 Primer día' : '🌿 Escapada'}
            </Badge>
            <Text style={styles.dateText}>{formatDateShort(place.date)}</Text>
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {place.title}
          </Text>

          <Text style={styles.locationText} numberOfLines={1}>
            {flag} {place.cityName}, {place.country}
          </Text>
        </View>

        {/* Right: Expand Indicator & Close (44x44 touch targets) */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={styles.closeTouchArea}
            onPress={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onClose();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Cerrar tarjeta"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={styles.closeCircle}>
              <Text style={styles.closeText}>✕</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.expandIcon}>⌃</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 30,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: Radii['2xl'],
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    ...Shadows.lg,
    gap: Spacing.md,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: Radii.lg,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Radii.lg,
    backgroundColor: '#FAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  photoPlaceholderEmoji: {
    fontSize: 28,
  },
  infoColumn: {
    flex: 1,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 3,
  },
  dateText: {
    ...Typography.caption,
    fontSize: 11,
    color: '#66737C',
  },
  title: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: '#1E252B',
    fontWeight: '800',
    marginBottom: 2,
  },
  locationText: {
    ...Typography.caption,
    fontSize: 12,
    color: '#4A7C9B',
    fontWeight: '600',
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
  },
  closeTouchArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    marginRight: -8,
  },
  closeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 11,
    color: '#66737C',
    fontWeight: '800',
  },
  expandIcon: {
    fontSize: 18,
    color: '#E86A58',
    fontWeight: '800',
  },
});
