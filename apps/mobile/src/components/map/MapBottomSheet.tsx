import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { AndreaMapPlace } from '../../types/map';
import { MapPlaceGroup } from '../../features/places/groupMapPlaces';
import { Colors } from '../../theme/colors';
import { Radii, Spacing } from '../../theme/tokens';
import { Badge } from '../ui';
import { IconLock, IconCalendar } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';

interface MapBottomSheetProps {
  place: AndreaMapPlace | null;
  group?: MapPlaceGroup | null;
  onClose: () => void;
  onViewDetail?: (place: AndreaMapPlace) => void;
  onEditLocation?: (place: AndreaMapPlace) => void;
  onSelectPlaceFromGroup?: (place: AndreaMapPlace) => void;
}

export function MapBottomSheet({
  place,
  group,
  onClose,
  onViewDetail,
  onEditLocation,
  onSelectPlaceFromGroup,
}: MapBottomSheetProps) {
  // If we have a group with multiple items and no specific place selected
  if (group && group.items.length > 1 && !place) {
    return (
      <View style={styles.sheetContainer}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Badge variant="butter">Colección de {group.itemCount} momentos</Badge>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <View style={styles.closeCircle}>
                <Text style={styles.closeBtn}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Group Title */}
          <Text style={styles.groupLocationTitle} numberOfLines={1}>
            {group.title || 'Mismo rincón'}
          </Text>
          <Text style={styles.groupSubtitle}>
            Historias y recuerdos compartidos en este mismo lugar
          </Text>

          {/* List of Places in this spot */}
          <ScrollView style={styles.groupItemsList} showsVerticalScrollIndicator={false}>
            {group.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.groupItemRow}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic('selection');
                  if (onSelectPlaceFromGroup) {
                    onSelectPlaceFromGroup(item);
                  } else if (onViewDetail) {
                    onViewDetail(item);
                  }
                }}
              >
                <View style={styles.groupItemEmojiBox}>
                  <Text style={styles.groupItemEmoji}>
                    {item.type === 'memory'
                      ? '♥'
                      : item.type === 'restaurant'
                      ? '🍽️'
                      : item.type === 'surprise'
                      ? '🎁'
                      : '✦'}
                  </Text>
                </View>
                <View style={styles.groupItemInfo}>
                  <Text style={styles.groupItemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.date && (
                    <Text style={styles.groupItemDate}>
                      🗓️ {item.date}
                    </Text>
                  )}
                </View>
                <Text style={styles.groupItemChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

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

        {/* Action Button Row */}
        <View style={styles.footerRow}>
          {onEditLocation && (
            <TouchableOpacity
              style={styles.editLocationButton}
              activeOpacity={0.8}
              onPress={() => onEditLocation(place)}
            >
              <Text style={styles.editLocationButtonText}>📍 Mover pin / Editar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() => onViewDetail && onViewDetail(place)}
          >
            <Text style={styles.actionButtonText}>Ver detalle completo</Text>
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
    backgroundColor: 'rgba(8, 18, 36, 0.92)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        } as any)
      : {}),
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
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
  groupLocationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: Spacing.sm,
  },
  groupItemsList: {
    maxHeight: 180,
    marginVertical: Spacing.xs,
  },
  groupItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 6,
    padding: Spacing.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  groupItemEmojiBox: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  groupItemEmoji: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  groupItemInfo: {
    flex: 1,
  },
  groupItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  groupItemDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 1,
  },
  groupItemChevron: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: Spacing.xs,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  placeImage: {
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailsBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  secretHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  secretHintText: {
    fontSize: 11,
    color: '#FF8A9E',
    fontStyle: 'italic',
    flex: 1,
  },
  description: {
    fontSize: 12.5,
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
    paddingLeft: Spacing.xs,
    borderLeftWidth: 2,
    borderLeftColor: '#E05666',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  editLocationButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editLocationButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    backgroundColor: '#E05666',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
