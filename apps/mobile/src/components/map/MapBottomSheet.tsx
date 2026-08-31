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
import { Badge } from '../ui';
import { IconCalendar, IconX, IconHeart, IconUtensils, IconSparkles } from '../ui/Icons';
import { triggerHaptic } from '../../utils/haptics';

interface MapBottomSheetProps {
  place: AndreaMapPlace | null;
  group?: MapPlaceGroup | null;
  onClose: () => void;
  onViewDetail?: (place: AndreaMapPlace) => void;
  onEditLocation?: (place: AndreaMapPlace) => void;
  onOpenGallery?: (place: AndreaMapPlace) => void;
  onSelectPlaceFromGroup?: (place: AndreaMapPlace) => void;
}

export function MapBottomSheet({
  place,
  group,
  onClose,
  onViewDetail,
  onEditLocation,
  onOpenGallery,
  onSelectPlaceFromGroup,
}: MapBottomSheetProps) {
  const groupItems = (group && (group.items || (group as any).places)) || [];
  if (group && groupItems.length > 1 && !place) {
    return (
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.handleBar} />
          <View style={styles.headerRow}>
            <Badge variant="butter">✦ {group.itemCount || groupItems.length} momentos juntos aquí</Badge>
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

          <Text style={styles.groupLocationTitle} numberOfLines={1}>
            {group.title || 'Mismo rincón'}
          </Text>
          <Text style={styles.groupSubtitle}>
            Historias y recuerdos inolvidables compartidos en este lugar
          </Text>

          <ScrollView
            style={styles.groupItemsList}
            showsVerticalScrollIndicator={false}
          >
            {groupItems.map((item) => {
              const isMemory = item.type === 'memory';
              const isRest = item.type === 'restaurant';
              const isStage = item.type === 'stage';
              const isDate = item.type === 'date';

              const accentColor = isStage
                ? '#5B7A62'
                : isMemory
                ? '#E05666'
                : isRest
                ? '#D4AF37'
                : isDate
                ? '#E28743'
                : '#766B72';

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
                  <View style={[styles.groupItemIconBox, { backgroundColor: accentColor + '18' }]}>
                    {isStage ? (
                      <Text style={{ fontSize: 13 }}>🏡</Text>
                    ) : isMemory ? (
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
                        {item.date} {item.subtitle ? '· ' + item.subtitle : ''}
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

  const photoCount = Array.from(
    new Set([
      ...(place.photos || []),
      ...(place.imageUrl ? [place.imageUrl] : []),
    ])
  ).filter(Boolean).length;

  const getTypeBadge = () => {
    const isHotel = (place.type as string) === 'hotel' || (place.type === 'trip' && place.accommodation && !place.tripDurationDays);
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {place.type === 'stage' && <Badge variant="neutral">🏡 Etapa</Badge>}
        {place.type === 'trip' && !isHotel && <Badge variant="secondary">✈️ Viaje</Badge>}
        {place.type === 'date' && <Badge variant="butter">🥂 Cita</Badge>}
        {place.type === 'restaurant' && <Badge variant="butter">🍽️ Restaurante</Badge>}
        {isHotel && <Badge variant="secondary">🏨 Hotel / Airbnb</Badge>}
        {place.type === 'memory' && <Badge variant="primary">📍 Rincón Familiar</Badge>}
        {place.type === 'future_place' && <Badge variant="mistBlue">✨ Futuro Deseo</Badge>}

        {place.emotionTag ? (
          <Badge variant="primary">✨ {place.emotionTag}</Badge>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.sheetContainer} pointerEvents="box-none">
      <View style={styles.card}>
        <View style={styles.handleBar} />
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

        <View style={styles.bodyRow}>
          {place.imageUrl && (
            <Image source={{ uri: place.imageUrl }} style={styles.placeImage} />
          )}

          <View style={styles.detailsBlock}>
            <Text style={styles.title} numberOfLines={2}>
              {place.title}
            </Text>

            {place.subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {place.subtitle}
              </Text>
            )}

            {place.type === 'stage' && place.startDate ? (
              <View style={styles.dateRow}>
                <Text style={styles.stageDateBadgeText}>
                  🏡 {place.startDate} ➔ {place.isOngoing ? 'Actualidad' : place.endDate || 'Nov 2025'}
                </Text>
              </View>
            ) : place.date ? (
              <View style={styles.dateRow}>
                <IconCalendar size={12} color="#766B72" />
                <Text style={styles.dateText}>{place.date}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {place.description && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText} numberOfLines={2}>
              "{place.description}"
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          {onOpenGallery && (
            <TouchableOpacity
              style={styles.btnGallery}
              activeOpacity={0.8}
              onPress={() => onOpenGallery(place)}
            >
              <Text style={styles.btnGalleryText}>📸 Galería ({photoCount})</Text>
            </TouchableOpacity>
          )}

          {onEditLocation && (
            <TouchableOpacity
              style={styles.btnEdit}
              activeOpacity={0.8}
              onPress={() => onEditLocation(place)}
            >
              <Text style={styles.btnEditText}>✏️</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => onViewDetail && onViewDetail(place)}
          >
            <Text style={styles.btnPrimaryText}>Ver detalle →</Text>
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
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFF8F2',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E6DDD5',
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  closeBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0ECE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  placeImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F0ECE8',
  },
  detailsBlock: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#766B72',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#766B72',
    fontWeight: '600',
  },
  stageDateBadgeText: {
    fontSize: 11,
    color: '#5B7A62',
    fontWeight: '700',
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#EF826A',
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#554A53',
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  btnGallery: {
    flex: 1.4,
    backgroundColor: '#F0ECE8',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnGalleryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
  },
  btnEdit: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEditText: {
    fontSize: 14,
  },
  btnPrimary: {
    flex: 1.8,
    backgroundColor: '#EF826A',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF826A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  groupLocationTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#3A2F38',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginBottom: 10,
  },
  groupItemsList: {
    maxHeight: 220,
  },
  groupItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 6,
  },
  timelineAccentLine: {
    width: 3,
    height: 24,
    borderRadius: 2,
    marginRight: 8,
  },
  groupItemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  groupItemInfo: {
    flex: 1,
  },
  groupItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
  },
  groupItemDate: {
    fontSize: 11,
    color: '#766B72',
  },
  groupItemChevron: {
    fontSize: 18,
    color: '#9E8ACD',
    fontWeight: 'bold',
  },
});
