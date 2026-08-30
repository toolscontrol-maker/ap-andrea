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
import { Radii, Shadows, Spacing } from '../../theme/tokens';
import { Badge } from '../ui';
import { IconLock, IconCalendar, IconX, IconHeart, IconUtensils, IconSparkles } from '../ui/Icons';
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
  // ── CASE A: SAME-PLACE COLLECTION SHEET ──
  if (group && group.items.length > 1 && !place) {
    return (
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <View style={styles.card}>
          {/* Centered drag handle */}
          <View style={styles.handleBar} />

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Badge variant="butter">✦ {group.itemCount} momentos juntos aquí</Badge>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtnCircle}
              accessibilityLabel="Cerrar"
            >
              <IconX size={14} color="#766B72" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Group Title & Subtitle */}
          <Text style={styles.groupLocationTitle} numberOfLines={1}>
            {group.title || 'Mismo rincón'}
          </Text>
          <Text style={styles.groupSubtitle}>
            Historias y recuerdos inolvidables compartidos en este lugar
          </Text>

          {/* Timeline of Moments */}
          <ScrollView
            style={styles.groupItemsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.xs }}
          >
            {group.items.map((item, idx) => {
              const isMemory = item.type === 'memory';
              const isRest = item.type === 'restaurant';
              const isTrip = item.type === 'trip' || item.type === 'future_place';

              const accentColor = isMemory ? '#E05666' : isRest ? '#D4AF37' : isTrip ? '#5C9F9A' : '#766B72';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.groupItemRow}
                  activeOpacity={0.75}
                  onPress={() => {
                    triggerHaptic('selection');
                    if (onSelectPlaceFromGroup) {
                      onSelectPlaceFromGroup(item);
                    } else if (onViewDetail) {
                      onViewDetail(item);
                    }
                  }}
                >
                  <View style={[styles.timelineAccentLine, { backgroundColor: accentColor }]} />
                  <View style={[styles.groupItemIconBox, { backgroundColor: `${accentColor}18` }]}>
                    {isMemory ? (
                      <IconHeart size={14} color={accentColor} strokeWidth={2.2} />
                    ) : isRest ? (
                      <IconUtensils size={14} color={accentColor} strokeWidth={2.2} />
                    ) : (
                      <IconSparkles size={14} color={accentColor} strokeWidth={2.2} />
                    )}
                  </View>
                  <View style={styles.groupItemInfo}>
                    <Text style={styles.groupItemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.date && (
                      <Text style={styles.groupItemDate}>
                        {item.date} {item.subtitle ? `· ${item.subtitle}` : ''}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.groupItemChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
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
        return <Badge variant="primary">♥ Recuerdo</Badge>;
      case 'restaurant':
        return <Badge variant="butter">🍽️ Restaurante</Badge>;
      case 'trip':
        return <Badge variant="secondary">✈️ Viaje</Badge>;
      case 'future_place':
        return <Badge variant="mistBlue">✨ Sueño futuro</Badge>;
      case 'surprise':
        return <Badge variant="secondary">🎁 Sorpresa</Badge>;
      case 'important_date':
        return <Badge variant="butter">🗓️ Fecha especial</Badge>;
      default:
        return <Badge variant="neutral">📍 Rincón</Badge>;
    }
  };

  return (
    <View style={styles.sheetContainer} pointerEvents="box-none">
      <View style={styles.card}>
        {/* Centered drag handle */}
        <View style={styles.handleBar} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          {getTypeBadge()}
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeBtnCircle}
            accessibilityLabel="Cerrar"
          >
            <IconX size={14} color="#766B72" strokeWidth={2.2} />
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
                <IconCalendar size={12} color="#766B72" />
                <Text style={styles.dateText}>{place.date}</Text>
              </View>
            )}

            {isSecretSurprise && (
              <View style={styles.secretHintRow}>
                <IconLock size={12} color="#E05666" />
                <Text style={styles.secretHintText}>
                  Ubicación aproximada. Los detalles se revelarán cuando llegue el momento.
                </Text>
              </View>
            )}
          </View>
        </View>

        {place.description && !isSecretSurprise && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText} numberOfLines={3}>
              "{place.description}"
            </Text>
          </View>
        )}

        {/* Action Button Row */}
        <View style={styles.footerRow}>
          {onEditLocation && (
            <TouchableOpacity
              style={styles.btnSecondary}
              activeOpacity={0.8}
              onPress={() => onEditLocation(place)}
            >
              <Text style={styles.btnSecondaryText}>📍 Mover pin</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => onViewDetail && onViewDetail(place)}
          >
            <Text style={styles.btnPrimaryText}>Ver detalle completo →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 88 : 98,
    left: Spacing.md,
    right: Spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFCFA',
    borderRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 16,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(58, 47, 56, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  closeBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLocationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2B2129',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginBottom: Spacing.md,
  },
  groupItemsList: {
    maxHeight: 220,
  },
  groupItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAF7F2',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.05)',
  },
  timelineAccentLine: {
    width: 3,
    height: 24,
    borderRadius: 1.5,
    marginRight: 10,
  },
  groupItemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  groupItemInfo: {
    flex: 1,
  },
  groupItemTitle: {
    fontWeight: '600',
    fontSize: 13.5,
    color: '#2B2129',
    letterSpacing: -0.15,
  },
  groupItemDate: {
    fontSize: 11,
    color: '#766B72',
    marginTop: 1,
  },
  groupItemChevron: {
    fontSize: 18,
    color: '#A89CA4',
    marginLeft: 6,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: 4,
  },
  placeImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  detailsBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2129',
    letterSpacing: -0.3,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#766B72',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11.5,
    color: '#766B72',
  },
  secretHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  secretHintText: {
    fontSize: 11,
    color: '#E05666',
    flex: 1,
    lineHeight: 14,
  },
  quoteCard: {
    backgroundColor: '#FAF7F2',
    borderRadius: 12,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.05)',
  },
  quoteText: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#554A51',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  btnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
  },
  btnSecondaryText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#554A51',
  },
  btnPrimary: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    backgroundColor: '#E05666',
    shadowColor: '#E05666',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
