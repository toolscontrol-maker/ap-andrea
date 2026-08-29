import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AndreaMapPlace } from '../../types/map';
import { Colors } from '../../theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../../theme/tokens';
import { Badge, Button } from '../ui';
import { IconLock, IconCalendar } from '../ui/Icons';

interface MapBottomSheetProps {
  place: AndreaMapPlace | null;
  onClose: () => void;
  onViewDetail?: (place: AndreaMapPlace) => void;
}

export function MapBottomSheet({ place, onClose, onViewDetail }: MapBottomSheetProps) {
  if (!place) return null;

  const isSecretSurprise = place.type === 'surprise' && place.isRevealed === false;

  const getTypeBadge = () => {
    switch (place.type) {
      case 'memory':
        return <Badge variant="primary">Recuerdo</Badge>;
      case 'restaurant':
        return <Badge variant="butter">Restaurante</Badge>;
      case 'trip':
        return <Badge variant="secondary">Viaje</Badge>;
      case 'future_place':
        return <Badge variant="mistBlue">Sueño futuro</Badge>;
      case 'surprise':
        return <Badge variant="secondary">Sorpresa</Badge>;
      case 'important_date':
        return <Badge variant="butter">Fecha especial</Badge>;
      default:
        return <Badge variant="neutral">Rincón</Badge>;
    }
  };

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.card}>
        {/* Top bar with drag handle / close button */}
        <View style={styles.headerRow}>
          {getTypeBadge()}
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={styles.closeCircle}>
              <Text style={styles.closeBtn}>✕</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        <View style={styles.bodyRow}>
          {place.imageUrl && !isSecretSurprise && (
            <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
          )}

          <View style={styles.detailsBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {isSecretSurprise ? 'Plan Secreto en Preparación' : place.title}
            </Text>

            {place.subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {place.subtitle}
              </Text>
            )}

            {place.date && !isSecretSurprise && (
              <View style={styles.dateRow}>
                <IconCalendar size={12} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.dateText}>{place.date}</Text>
              </View>
            )}

            {isSecretSurprise && (
              <View style={styles.secretHintRow}>
                <IconLock size={12} color="#FF6B81" />
                <Text style={styles.secretHintText}>
                  Ubicación aproximada. Los detalles se revelarán cuando llegue el momento.
                </Text>
              </View>
            )}
          </View>
        </View>

        {place.description && !isSecretSurprise && (
          <Text style={styles.description} numberOfLines={2}>
            "{place.description}"
          </Text>
        )}

        {/* Action Button */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => onViewDetail && onViewDetail(place)}
          >
            <Text style={styles.actionButtonText}>Ver detalle del momento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 85 : 95,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(8, 18, 36, 0.94)',
    borderRadius: Radii['2xl'],
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  closeCircle: {
    width: 26,
    height: 26,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  placeImage: {
    width: 64,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailsBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    fontSize: 15.5,
    color: '#FFFFFF',
    marginBottom: 2,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  secretHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  secretHintText: {
    fontSize: 10.5,
    color: '#FF8A9E',
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    lineHeight: 16,
  },
  footerRow: {
    marginTop: Spacing.xs,
  },
  actionButton: {
    backgroundColor: '#38B6FF',
    paddingVertical: 9,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#030C1E',
    fontSize: 13,
    fontWeight: '700',
  },
});
