import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { AndreaMapPlace } from '../../types/map';
import { triggerHaptic } from '../../utils/haptics';
import { IconMapPin } from '../ui/Icons';

interface PlaceDetailModalProps {
  visible: boolean;
  place: AndreaMapPlace | null;
  onClose: () => void;
  onOpenGallery: (place: AndreaMapPlace) => void;
  onEditPlace: (place: AndreaMapPlace) => void;
}

export function PlaceDetailModal({
  visible,
  place,
  onClose,
  onOpenGallery,
  onEditPlace,
}: PlaceDetailModalProps) {
  if (!place) return null;

  const photoCount = Array.from(
    new Set([
      ...(place.photos || []),
      ...(place.imageUrl ? [place.imageUrl] : []),
    ])
  ).filter(Boolean).length;

  const renderTypeHeader = () => {
    switch (place.type) {
      case 'stage':
        return (
          <View style={[styles.typeBadgeBox, { backgroundColor: '#EAF2EB' }]}>
            <Text style={[styles.typeBadgeText, { color: '#3A6B48' }]}>🏡 ETAPA DE VIDA JUNTOS</Text>
          </View>
        );
      case 'date':
        return (
          <View style={[styles.typeBadgeBox, { backgroundColor: '#FDF3E7' }]}>
            <Text style={[styles.typeBadgeText, { color: '#C67A1B' }]}>🥂 CITA ROMÁNTICA</Text>
          </View>
        );
      case 'trip':
        return (
          <View style={[styles.typeBadgeBox, { backgroundColor: '#F0ECF8' }]}>
            <Text style={[styles.typeBadgeText, { color: '#6A4DA8' }]}>✈️ VIAJE & ESCAPADA</Text>
          </View>
        );
      case 'restaurant':
        return (
          <View style={[styles.typeBadgeBox, { backgroundColor: '#FDF8E8' }]}>
            <Text style={[styles.typeBadgeText, { color: '#B8860B' }]}>🍽️ RESTAURANTE & GASTRONOMÍA</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.typeBadgeBox, { backgroundColor: '#FBEBEB' }]}>
            <Text style={[styles.typeBadgeText, { color: '#D94354' }]}>❤️ RECUERDO ESPECIAL</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.topHandleBar} />

          <View style={styles.topHeader}>
            {renderTypeHeader()}
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {place.imageUrl && (
              <View style={styles.heroImageContainer}>
                <Image source={{ uri: place.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.galleryOverlayBtn}
                  activeOpacity={0.85}
                  onPress={() => onOpenGallery(place)}
                >
                  <Text style={styles.galleryOverlayBtnText}>📸 Ver galería ({photoCount})</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.titleText}>{place.title}</Text>
            <View style={styles.addressRow}>
              <IconMapPin size={14} color="#EF826A" />
              <Text style={styles.addressText} numberOfLines={2}>
                {place.formattedAddress || place.subtitle || 'Valencia, España'}
              </Text>
            </View>

            {place.type === 'stage' && (
              <View style={styles.infoCard}>
                <Text style={styles.cardSectionTitle}>📅 Período de Convivencia</Text>
                <View style={styles.stageDateRow}>
                  <View style={styles.stageDateCol}>
                    <Text style={styles.dateLabel}>DESDE</Text>
                    <Text style={styles.dateValue}>{place.startDate || place.date || 'Inicio'}</Text>
                  </View>
                  <Text style={styles.stageArrow}>➔</Text>
                  <View style={styles.stageDateCol}>
                    <Text style={styles.dateLabel}>HASTA</Text>
                    <Text style={styles.dateValue}>
                      {place.isOngoing ? '🌟 En la actualidad' : place.endDate || 'Noviembre 2025'}
                    </Text>
                  </View>
                </View>
                {place.stageSummary && (
                  <Text style={styles.stageSummaryText}>✦ {place.stageSummary}</Text>
                )}
              </View>
            )}

            {place.type === 'date' && (
              <View style={styles.infoCard}>
                <Text style={styles.cardSectionTitle}>🥂 Detalles de la Cita</Text>
                {place.invitedBy && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Invitó:</Text>
                    <Text style={styles.detailValue}>
                      {place.invitedBy === 'tonet'
                        ? 'Tonet ❤️'
                        : place.invitedBy === 'andrea'
                        ? 'Andrea 💖'
                        : 'Plan de los dos ✨'}
                    </Text>
                  </View>
                )}

                {place.destination1 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Destino 1:</Text>
                    <Text style={styles.detailValue}>{place.destination1}</Text>
                  </View>
                )}

                {place.destination2 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Destino 2:</Text>
                    <Text style={styles.detailValue}>{place.destination2}</Text>
                  </View>
                )}
              </View>
            )}

            {place.type === 'trip' && (
              <View style={styles.infoCard}>
                <Text style={styles.cardSectionTitle}>✈️ Bitácora de Viaje</Text>
                {place.accommodation && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Alojamiento:</Text>
                    <Text style={styles.detailValue}>{place.accommodation}</Text>
                  </View>
                )}

                {place.tripDurationDays && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duración:</Text>
                    <Text style={styles.detailValue}>{place.tripDurationDays} días inolvidables</Text>
                  </View>
                )}

                {place.visitedPlaces && place.visitedPlaces.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.detailLabel}>Restaurantes y sitios visitados:</Text>
                    <View style={styles.visitedTagsRow}>
                      {place.visitedPlaces.map((spot, i) => (
                        <View key={i} style={styles.visitedTag}>
                          <Text style={styles.visitedTagText}>📍 {spot}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {place.type === 'memory' && (
              <View style={styles.infoCard}>
                <Text style={styles.cardSectionTitle}>❤️ Momento Inolvidable</Text>
                {place.hasDateRange && place.dateRangeEnd ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fechas:</Text>
                    <Text style={styles.detailValue}>
                      {place.date} al {place.dateRangeEnd}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha:</Text>
                    <Text style={styles.detailValue}>{place.date || 'Fecha especial'}</Text>
                  </View>
                )}

                {place.emotionTag && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Significado:</Text>
                    <Text style={[styles.detailValue, { color: '#EF826A', fontWeight: 'bold' }]}>
                      {place.emotionTag}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {place.description && (
              <View style={styles.storyCard}>
                <Text style={styles.storyCardHeader}>📖 NUESTRA HISTORIA</Text>
                <Text style={styles.storyCardText}>"{place.description}"</Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.galleryBtn}
                activeOpacity={0.85}
                onPress={() => onOpenGallery(place)}
              >
                <Text style={styles.galleryBtnText}>📸 Ver Galería ({photoCount} fotos)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.85}
                onPress={() => onEditPlace(place)}
              >
                <Text style={styles.editBtnText}>✏️ Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 24, 28, 0.7)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFF8F2',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '92%',
    minHeight: '70%',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 22,
  },
  topHandleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E6DDD5',
    alignSelf: 'center',
    marginBottom: 12,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  typeBadgeBox: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0ECE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3A2F38',
  },
  scrollArea: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    backgroundColor: '#F0ECE8',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlayBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(58, 47, 56, 0.82)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  galleryOverlayBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addressText: {
    fontSize: 13,
    color: '#766B72',
    fontFamily: 'Inter, sans-serif',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3A2F38',
    marginBottom: 10,
  },
  stageDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBF8F4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  stageDateCol: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A2F38',
  },
  stageArrow: {
    fontSize: 16,
    color: '#EF826A',
    paddingHorizontal: 8,
  },
  stageSummaryText: {
    fontSize: 12,
    color: '#6A5F68',
    fontStyle: 'italic',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#766B72',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#3A2F38',
    fontWeight: '700',
  },
  visitedTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  visitedTag: {
    backgroundColor: '#F5EFE8',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  visitedTagText: {
    fontSize: 12,
    color: '#3A2F38',
    fontWeight: '600',
  },
  storyCard: {
    backgroundColor: '#FFFDF9',
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF826A',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  storyCardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF826A',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  storyCardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#3A2F38',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  galleryBtn: {
    flex: 2,
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#EF826A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  galleryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3A2F38',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
  },
});
