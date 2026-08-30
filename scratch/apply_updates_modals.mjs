import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const mobileRoot = path.join(projectRoot, 'apps', 'mobile');

// 1. PlaceGalleryModal.tsx
const placeGalleryContent = `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { AndreaMapPlace } from '../../types/map';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';

interface PlaceGalleryModalProps {
  visible: boolean;
  place: AndreaMapPlace | null;
  onClose: () => void;
  onAddPhoto: (placeId: string, newPhotoUrl: string) => void;
  onRemovePhoto?: (placeId: string, photoUrl: string) => void;
}

export function PlaceGalleryModal({
  visible,
  place,
  onClose,
  onAddPhoto,
}: PlaceGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!place) return null;

  const allPhotos: string[] = Array.from(
    new Set([
      ...(place.photos || []),
      ...(place.imageUrl ? [place.imageUrl] : []),
    ])
  ).filter(Boolean);

  const handlePhotoUploaded = (url: string | null) => {
    if (url) {
      triggerHaptic('success');
      onAddPhoto(place.id, url);
      Alert.alert('📸 Foto Añadida', 'La foto se ha guardado en la galería compartida del rincón.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.expandedContainer}>
          <View style={styles.topHandleBar} />
          <View style={styles.headerRow}>
            <View style={styles.headerTextGroup}>
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>📸 GALERÍA COMPARTIDA</Text>
              </View>
              <Text style={styles.placeTitle} numberOfLines={1}>
                {place.title}
              </Text>
              <Text style={styles.photoCountText}>
                {allPhotos.length} {allPhotos.length === 1 ? 'fotografía guardada' : 'fotografías guardadas'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              style={styles.closeBtn}
              accessibilityLabel="Cerrar galería"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.galleryScrollView}
            contentContainerStyle={styles.galleryGrid}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.uploadCard}>
              <Text style={styles.uploadCardTitle}>Añadir nueva foto a este rincón</Text>
              <Text style={styles.uploadCardSubtitle}>
                Sube fotos de tus momentos aquí para que Tonet y Andrea las tengan siempre sincronizadas
              </Text>
              <PhotoUploadField
                photoUrl={null}
                onPhotoSelected={handlePhotoUploaded}
                placeholderText="Toca aquí para seleccionar de la galería o cámara"
              />
            </View>

            {allPhotos.length > 0 ? (
              <View style={styles.photosGridWrapper}>
                {allPhotos.map((photo, index) => (
                  <TouchableOpacity
                    key={photo + '-' + index}
                    style={styles.photoThumbnailCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      triggerHaptic('selection');
                      setSelectedImage(photo);
                    }}
                  >
                    <Image source={{ uri: photo }} style={styles.photoThumbnail} resizeMode="cover" />
                    <View style={styles.photoBadgeOverlay}>
                      <Text style={styles.photoBadgeText}>Foto #{index + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyGalleryCard}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyTitle}>Aún no hay fotos subidas</Text>
                <Text style={styles.emptySubtitle}>
                  Sé el primero en subir una foto de este lugar inolvidable
                </Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>

        {selectedImage && (
          <Modal
            visible={Boolean(selectedImage)}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedImage(null)}
          >
            <View style={styles.lightboxOverlay}>
              <TouchableOpacity
                style={styles.lightboxCloseBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.lightboxCloseText}>✕ Cerrar</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: selectedImage }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 24, 28, 0.75)',
    justifyContent: 'flex-end',
  },
  expandedContainer: {
    backgroundColor: '#FFF8F2',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 24,
  },
  topHandleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E6DDD5',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.08)',
    marginBottom: 12,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: 12,
  },
  titleBadge: {
    backgroundColor: '#F4C95D',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  titleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3A2F38',
    letterSpacing: 0.5,
  },
  placeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 2,
  },
  photoCountText: {
    fontSize: 13,
    color: '#766B72',
    fontFamily: 'Inter, sans-serif',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0ECE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A2F38',
  },
  galleryScrollView: {
    flex: 1,
  },
  galleryGrid: {
    paddingBottom: 30,
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  uploadCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  uploadCardSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginBottom: 12,
  },
  photosGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoThumbnailCard: {
    width: (screenWidth > 680 ? 680 : screenWidth - 52) / 2 - 6,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5EFE8',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(58, 47, 56, 0.65)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  photoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyGalleryCard: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#766B72',
    textAlign: 'center',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 10,
  },
  lightboxCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  lightboxImage: {
    width: '92%',
    height: '80%',
  },
});
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'PlaceGalleryModal.tsx'), placeGalleryContent, 'utf8');

// 2. PlaceDetailModal.tsx
const placeDetailContent = `import React from 'react';
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
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'PlaceDetailModal.tsx'), placeDetailContent, 'utf8');

// 3. MapBottomSheet.tsx
const mapBottomSheetContent = `import React from 'react';
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
    switch (place.type) {
      case 'stage':
        return <Badge variant="neutral">🏡 Etapa</Badge>;
      case 'memory':
        return <Badge variant="primary">♥ Recuerdo</Badge>;
      case 'date':
        return <Badge variant="butter">🥂 Cita</Badge>;
      case 'restaurant':
        return <Badge variant="butter">🍽️ Restaurante</Badge>;
      case 'trip':
        return <Badge variant="secondary">✈️ Viaje</Badge>;
      case 'future_place':
        return <Badge variant="mistBlue">✨ Sueño futuro</Badge>;
      case 'surprise':
        return <Badge variant="secondary">🎁 Sorpresa</Badge>;
      default:
        return <Badge variant="neutral">📍 Rincón</Badge>;
    }
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
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'MapBottomSheet.tsx'), mapBottomSheetContent, 'utf8');

// 4. AddPlaceLocationModal.tsx
const addPlaceModalContent = `import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import {
  searchGooglePlaces,
  reverseGeocodeGoogleCoordinates,
  GeocodingResult,
} from '../../services/googlePlacesGeocoding';
import { loadGoogleMapsSDK, ANDREA_GOOGLE_MAP_STYLES } from '../../lib/googleMaps';
import { AndreaMapPlace, MapPlaceType, LocationPrecision, LocationSource } from '../../types/map';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';

interface AddPlaceLocationModalProps {
  visible: boolean;
  onClose: () => void;
  onSavePlace: (place: AndreaMapPlace) => void;
  initialPlace?: AndreaMapPlace | null;
}

type ModalStep = 'search' | 'confirm_pin' | 'details';

export function AddPlaceLocationModal({
  visible,
  onClose,
  onSavePlace,
  initialPlace,
}: AddPlaceLocationModalProps) {
  const [step, setStep] = useState<ModalStep>('search');

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searchContext, setSearchContext] = useState<'valencia' | 'global'>('valencia');

  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number]>([
    -0.3763, 39.4699,
  ]);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [verifiedCity, setVerifiedCity] = useState('Valencia');
  const [verifiedCountry, setVerifiedCountry] = useState('España');
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('exact');
  const [locationSource, setLocationSource] = useState<LocationSource>('google_places');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MapPlaceType>('memory');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('2025-01-05');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(false);
  const [stageSummary, setStageSummary] = useState('');

  const [hasDateRange, setHasDateRange] = useState(false);
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [emotionTag, setEmotionTag] = useState('');

  const [invitedBy, setInvitedBy] = useState<'tonet' | 'andrea' | 'both'>('both');
  const [destination1, setDestination1] = useState('');
  const [destination2, setDestination2] = useState('');

  const [accommodation, setAccommodation] = useState('');
  const [tripDurationDays, setTripDurationDays] = useState('3');
  const [visitedPlacesText, setVisitedPlacesText] = useState('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      if (initialPlace) {
        setTitle(initialPlace.title);
        setVerifiedName(initialPlace.title);
        setVerifiedAddress(initialPlace.formattedAddress || initialPlace.subtitle || '');
        setVerifiedCity(initialPlace.city || 'Valencia');
        setSelectedCoordinates([initialPlace.longitude, initialPlace.latitude]);
        setLocationPrecision(initialPlace.precision || 'exact');
        setLocationSource(initialPlace.source || 'google_places');
        setType(initialPlace.type || 'memory');
        setDate(initialPlace.date || new Date().toISOString().split('T')[0]);
        setDescription(initialPlace.description || '');
        setPhotoUrl(initialPlace.imageUrl || null);
        setSearchQuery(initialPlace.title);

        setStartDate(initialPlace.startDate || initialPlace.date || '');
        setEndDate(initialPlace.endDate || '');
        setIsOngoing(Boolean(initialPlace.isOngoing));
        setStageSummary(initialPlace.stageSummary || '');
        setHasDateRange(Boolean(initialPlace.hasDateRange));
        setDateRangeEnd(initialPlace.dateRangeEnd || '');
        setEmotionTag(initialPlace.emotionTag || '');
        setInvitedBy(initialPlace.invitedBy || 'both');
        setDestination1(initialPlace.destination1 || '');
        setDestination2(initialPlace.destination2 || '');
        setAccommodation(initialPlace.accommodation || '');
        setTripDurationDays(String(initialPlace.tripDurationDays || 3));
        setVisitedPlacesText((initialPlace.visitedPlaces || []).join(', '));

        setStep('search');
      } else {
        setStep('search');
        setSearchQuery('');
        setResults([]);
        setTitle('');
        setVerifiedName('');
        setVerifiedAddress('');
        setDescription('');
        setPhotoUrl(null);
        setType('memory');
        setSelectedCoordinates([-0.3763, 39.4699]);
        setLocationPrecision('exact');
        setLocationSource('google_places');

        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setIsOngoing(false);
        setStageSummary('');
        setHasDateRange(false);
        setDateRangeEnd('');
        setEmotionTag('');
        setInvitedBy('both');
        setDestination1('');
        setDestination2('');
        setAccommodation('');
        setTripDurationDays('3');
        setVisitedPlacesText('');
      }
    }
  }, [visible, initialPlace]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchGooglePlaces(searchQuery, {
        country: searchContext === 'valencia' ? 'es' : undefined,
        proximity: searchContext === 'valencia' ? [-0.3763, 39.4699] : undefined,
      });
      setResults(res);
      setIsSearching(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, searchContext]);

  useEffect(() => {
    if (step !== 'confirm_pin' || Platform.OS !== 'web' || typeof window === 'undefined') return;

    let isMounted = true;

    async function initMiniMap() {
      if (!mapContainerRef.current) return;

      const googleMaps = await loadGoogleMapsSDK();
      if (!isMounted || !mapContainerRef.current || !googleMaps) return;

      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }

      const center = { lat: selectedCoordinates[1], lng: selectedCoordinates[0] };
      const map = new googleMaps.Map(mapContainerRef.current, {
        center,
        zoom: locationPrecision === 'city' ? 12 : 16,
        styles: ANDREA_GOOGLE_MAP_STYLES,
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        backgroundColor: '#FFF8F2',
      });

      const markerColor =
        type === 'stage'
          ? '#5B7A62'
          : type === 'restaurant'
          ? '#F4C95D'
          : type === 'date'
          ? '#E28743'
          : type === 'trip'
          ? '#9E8ACD'
          : '#EF826A';

      const markerIcon =
        type === 'stage'
          ? '🏡'
          : type === 'restaurant'
          ? '🍽️'
          : type === 'date'
          ? '🥂'
          : type === 'trip'
          ? '✈️'
          : '❤️';

      const pinSvg =
        '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="16" fill="' +
        markerColor +
        '" stroke="#FFFFFF" stroke-width="2.5" filter="drop-shadow(0 3px 8px rgba(58,47,56,0.16))"/><text x="20" y="24" text-anchor="middle" font-size="14">' +
        markerIcon +
        '</text></svg>';

      const marker = new googleMaps.Marker({
        position: center,
        map,
        draggable: true,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
          scaledSize: new googleMaps.Size(40, 40),
          anchor: new googleMaps.Point(20, 20),
        },
      });

      markerInstanceRef.current = marker;

      marker.addListener('dragend', async () => {
        const pos = marker.getPosition();
        if (!pos) return;
        const lng = pos.lng();
        const lat = pos.lat();
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      map.addListener('click', async (e: any) => {
        if (!e.latLng) return;
        const lng = e.latLng.lng();
        const lat = e.latLng.lat();
        marker.setPosition(e.latLng);
        setSelectedCoordinates([lng, lat]);
        setLocationSource('manual_pin');
        setIsReverseGeocoding(true);
        const rev = await reverseGeocodeGoogleCoordinates([lng, lat]);
        if (rev) {
          setVerifiedAddress(rev.formattedAddress);
          setVerifiedCity(rev.city || 'Valencia');
          setVerifiedCountry(rev.country || 'España');
        }
        setIsReverseGeocoding(false);
      });

      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      initMiniMap();
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (markerInstanceRef.current && markerInstanceRef.current.setMap) {
        markerInstanceRef.current.setMap(null);
        markerInstanceRef.current = null;
      }
    };
  }, [step, selectedCoordinates[0], selectedCoordinates[1], type, locationPrecision]);

  const handleSelectSuggestion = (res: GeocodingResult) => {
    triggerHaptic('selection');
    setSelectedCoordinates(res.coordinates);
    setVerifiedName(res.name);
    setVerifiedAddress(res.formattedAddress);
    setVerifiedCity(res.city || 'Valencia');
    setVerifiedCountry(res.country || 'España');
    setTitle(res.name);
    setLocationSource('google_places');

    if (res.featureType === 'restaurant' || res.category === 'restaurant') {
      setType('restaurant');
    }

    setStep('confirm_pin');
  };

  const handleManualPin = () => {
    triggerHaptic('medium');
    setSelectedCoordinates([-0.3763, 39.4699]);
    setVerifiedName('Punto en el mapa');
    setVerifiedAddress('Valencia, España');
    setVerifiedCity('Valencia');
    setTitle(searchQuery || 'Nuestro Rincón');
    setLocationSource('manual_pin');
    setStep('confirm_pin');
  };

  const handleConfirmPin = () => {
    triggerHaptic('medium');
    if (!title.trim() && verifiedName) {
      setTitle(verifiedName);
    }
    setStep('details');
  };

  const handleFinalSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Por favor escribe un nombre para este lugar.');
      return;
    }

    triggerHaptic('success');

    const visitedPlaces = visitedPlacesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const placeToSave: AndreaMapPlace = {
      id: initialPlace?.id || ('place-verified-' + Date.now()),
      type,
      title: title.trim(),
      subtitle: verifiedAddress || verifiedCity,
      description: description.trim() || undefined,
      latitude: selectedCoordinates[1],
      longitude: selectedCoordinates[0],
      precision: locationPrecision,
      source: locationSource,
      verifiedByUser: true,
      formattedAddress: verifiedAddress,
      city: verifiedCity,
      imageUrl: photoUrl || initialPlace?.imageUrl || undefined,
      photos: initialPlace?.photos || (photoUrl ? [photoUrl] : []),
      date: date || new Date().toISOString().split('T')[0],
      isRevealed: true,

      startDate: type === 'stage' ? startDate : undefined,
      endDate: type === 'stage' ? (isOngoing ? undefined : endDate) : undefined,
      isOngoing: type === 'stage' ? isOngoing : undefined,
      stageSummary: type === 'stage' ? stageSummary : undefined,

      hasDateRange: type === 'memory' ? hasDateRange : undefined,
      dateRangeEnd: type === 'memory' && hasDateRange ? dateRangeEnd : undefined,
      emotionTag: type === 'memory' ? emotionTag : undefined,

      invitedBy: type === 'date' ? invitedBy : undefined,
      destination1: type === 'date' ? destination1 : undefined,
      destination2: type === 'date' ? destination2 : undefined,

      accommodation: type === 'trip' ? accommodation : undefined,
      tripDurationDays: type === 'trip' ? Number(tripDurationDays) || 3 : undefined,
      visitedPlaces: type === 'trip' ? visitedPlaces : undefined,
    };

    onSavePlace(placeToSave);
    onClose();
    Alert.alert('📍 Guardado con Éxito', '"' + title.trim() + '" sincronizado.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetCard}>
          <View style={styles.topHeader}>
            {step !== 'search' ? (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('light');
                  setStep(step === 'details' ? 'confirm_pin' : 'search');
                }}
                style={styles.headerBackBtn}
              >
                <Text style={styles.headerBackText}>← Volver</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}

            <Text style={styles.headerTitle}>
              {initialPlace ? 'Editar Rincón' : 'Guardar Momento'}
            </Text>

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

          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={[styles.stepTab, step === 'search' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('search');
              }}
            >
              <Text style={[styles.stepTabText, step === 'search' && styles.stepTabTextActive]}>
                1. Buscar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, step === 'confirm_pin' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('confirm_pin');
              }}
            >
              <Text style={[styles.stepTabText, step === 'confirm_pin' && styles.stepTabTextActive]}>
                2. Ajustar Pin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, step === 'details' && styles.stepTabActive]}
              onPress={() => {
                triggerHaptic('selection');
                setStep('details');
              }}
            >
              <Text style={[styles.stepTabText, step === 'details' && styles.stepTabTextActive]}>
                3. Detalles
              </Text>
            </TouchableOpacity>
          </View>

          {step === 'search' && (
            <View style={styles.contentContainer}>
              <Text style={styles.stepSubtitle}>
                Busca en Google Maps cualquier restaurante, cafetería, playa, plaza o rincón:
              </Text>

              <View style={styles.searchBarWrapper}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ej: Casa d'Aragona, Honest Greens, Canet..."
                  placeholderTextColor="#9E8ACD"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {isSearching && <ActivityIndicator size="small" color="#EF826A" />}
              </View>

              <View style={styles.scopeChipsRow}>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'valencia' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('valencia')}
                >
                  <Text style={[styles.scopeChipText, searchContext === 'valencia' && styles.scopeChipTextActive]}>
                    📍 Valencia
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scopeChip, searchContext === 'global' && styles.scopeChipActive]}
                  onPress={() => setSearchContext('global')}
                >
                  <Text style={[styles.scopeChipText, searchContext === 'global' && styles.scopeChipTextActive]}>
                    🌍 Toda España / Viajes
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.resultsScrollView} keyboardShouldPersistTaps="handled">
                {results.map((res) => (
                  <TouchableOpacity
                    key={res.id}
                    style={styles.resultRow}
                    onPress={() => handleSelectSuggestion(res)}
                  >
                    <View style={styles.resultIconCircle}>
                      <Text style={styles.resultEmoji}>
                        {res.featureType === 'restaurant' ? '🍽️' : '📍'}
                      </Text>
                    </View>
                    <View style={styles.resultTextCol}>
                      <Text style={styles.resultMainTitle} numberOfLines={1}>
                        {res.name}
                      </Text>
                      <Text style={styles.resultSubAddress} numberOfLines={2}>
                        {res.formattedAddress}
                      </Text>
                    </View>
                    <Text style={styles.resultArrow}>→</Text>
                  </TouchableOpacity>
                ))}

                <View style={styles.manualPinSection}>
                  <TouchableOpacity style={styles.manualPinOutlineBtn} onPress={handleManualPin}>
                    <Text style={styles.manualPinOutlineBtnText}>
                      📌 ¿Prefieres arrastrar el pin manualmente? Pulsa aquí
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          {step === 'confirm_pin' && (
            <View style={styles.contentContainer}>
              <View style={styles.pinHeaderCard}>
                <Text style={styles.pinHeaderTitle} numberOfLines={1}>
                  {verifiedName || title || 'Ubicación seleccionada'}
                </Text>
                <Text style={styles.pinHeaderSubtitle} numberOfLines={2}>
                  {isReverseGeocoding ? 'Detectando dirección...' : verifiedAddress || verifiedCity}
                </Text>
                <TouchableOpacity style={styles.reSearchPill} onPress={() => setStep('search')}>
                  <Text style={styles.reSearchPillText}>🔍 Buscar otro sitio en Google Maps</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.miniMapContainer}>
                <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                <View style={styles.mapBadgeOverlay}>
                  <Text style={styles.mapBadgeText}>👆 Toca o arrastra para ajustar la posición</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.primaryActionButton} onPress={handleConfirmPin}>
                <Text style={styles.primaryActionText}>Continuar a Detalles →</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'details' && (
            <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Categoría del Lugar</Text>
              <View style={styles.categoryRow}>
                <TouchableOpacity
                  style={[styles.categoryPill, type === 'stage' && styles.categoryPillActive]}
                  onPress={() => setType('stage')}
                >
                  <Text style={styles.categoryPillText}>🏡 Etapa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'memory' && styles.categoryPillActive]}
                  onPress={() => setType('memory')}
                >
                  <Text style={styles.categoryPillText}>❤️ Recuerdo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'date' && styles.categoryPillActive]}
                  onPress={() => setType('date')}
                >
                  <Text style={styles.categoryPillText}>🥂 Cita</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'restaurant' && styles.categoryPillActive]}
                  onPress={() => setType('restaurant')}
                >
                  <Text style={styles.categoryPillText}>🍽️ Restaurante</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, type === 'trip' && styles.categoryPillActive]}
                  onPress={() => setType('trip')}
                >
                  <Text style={styles.categoryPillText}>✈️ Viaje</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nombre / Título</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Nuestra etapa en Canet, Cena en Don Salvatore..."
                value={title}
                onChangeText={setTitle}
              />

              {type === 'stage' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>🏡 Configuración de Etapa de Vida</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Inicio (Desde)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={startDate}
                        onChangeText={setStartDate}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subFieldLabel}>Fecha Fin (Hasta)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={isOngoing ? 'Actualidad' : 'YYYY-MM-DD'}
                        value={endDate}
                        onChangeText={setEndDate}
                        editable={!isOngoing}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setIsOngoing(!isOngoing)}
                  >
                    <Text style={styles.checkboxEmoji}>{isOngoing ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Actualmente viviendo o conviviendo aquí</Text>
                  </TouchableOpacity>

                  <Text style={styles.subFieldLabel}>Resumen de la etapa</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Convivencia junto al mar, paseos al atardecer..."
                    value={stageSummary}
                    onChangeText={setStageSummary}
                  />
                </View>
              )}

              {type === 'date' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>🥂 Configuración de la Cita</Text>
                  <Text style={styles.subFieldLabel}>¿Quién invitó?</Text>
                  <View style={styles.invitedRow}>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'tonet' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('tonet')}
                    >
                      <Text style={styles.invitedPillText}>Tonet ❤️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'andrea' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('andrea')}
                    >
                      <Text style={styles.invitedPillText}>Andrea 💖</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.invitedPill, invitedBy === 'both' && styles.invitedPillActive]}
                      onPress={() => setInvitedBy('both')}
                    >
                      <Text style={styles.invitedPillText}>Ambos ✨</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subFieldLabel}>Destino 1 (Plan / Sitio)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Cines ABC Park"
                    value={destination1}
                    onChangeText={setDestination1}
                  />

                  <Text style={styles.subFieldLabel}>Destino 2 (Opcional: Segundo sitio / Cena)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Cena en Don Salvatore"
                    value={destination2}
                    onChangeText={setDestination2}
                  />
                </View>
              )}

              {type === 'trip' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>✈️ Configuración de Viaje / Escapada</Text>
                  <Text style={styles.subFieldLabel}>¿Dónde nos alojamos?</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Hotel Boutique, Airbnb frente al mar..."
                    value={accommodation}
                    onChangeText={setAccommodation}
                  />

                  <Text style={styles.subFieldLabel}>Días de duración</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: 4"
                    keyboardType="numeric"
                    value={tripDurationDays}
                    onChangeText={setTripDurationDays}
                  />

                  <Text style={styles.subFieldLabel}>Restaurantes y sitios visitados (separados por comas)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Trattoria del Porto, Mirador del Faro, Café Central"
                    value={visitedPlacesText}
                    onChangeText={setVisitedPlacesText}
                  />
                </View>
              )}

              {type === 'memory' && (
                <View style={styles.specificFieldsBox}>
                  <Text style={styles.specificBoxTitle}>❤️ Connotación del Recuerdo</Text>
                  <Text style={styles.subFieldLabel}>Significado / Emoción clave</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ej: Primer beso, Donde supimos que estábamos enamorados..."
                    value={emotionTag}
                    onChangeText={setEmotionTag}
                  />

                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setHasDateRange(!hasDateRange)}
                  >
                    <Text style={styles.checkboxEmoji}>{hasDateRange ? '☑️' : '◻️'}</Text>
                    <Text style={styles.checkboxLabel}>Fue un rango de días (ej: fin de semana)</Text>
                  </TouchableOpacity>

                  {hasDateRange && (
                    <View style={{ marginTop: 6 }}>
                      <Text style={styles.subFieldLabel}>Fecha de Fin</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="YYYY-MM-DD"
                        value={dateRangeEnd}
                        onChangeText={setDateRangeEnd}
                      />
                    </View>
                  )}
                </View>
              )}

              {type !== 'stage' && (
                <>
                  <Text style={styles.fieldLabel}>Fecha Principal</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD"
                    value={date}
                    onChangeText={setDate}
                  />
                </>
              )}

              <Text style={styles.fieldLabel}>¿Qué pasó? / Nuestra Historia</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Cuenta lo que vivimos juntos, anécdotas, sensaciones..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Foto Principal de Portada</Text>
              <PhotoUploadField
                photoUrl={photoUrl}
                onPhotoSelected={setPhotoUrl}
                placeholderText="Toca para añadir foto desde la galería o cámara"
              />

              <TouchableOpacity style={styles.finalSaveButton} onPress={handleFinalSave}>
                <Text style={styles.finalSaveButtonText}>
                  💾 {initialPlace ? 'Guardar Cambios' : 'Anclar en el Mapa'}
                </Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 47, 56, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFF8F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '92%',
    minHeight: '65%',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3A2F38',
    fontFamily: 'Inter, sans-serif',
  },
  headerBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF826A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5EFE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6A5F68',
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    backgroundColor: '#F5EFE8',
    padding: 4,
    borderRadius: 12,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  stepTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A7F88',
  },
  stepTabTextActive: {
    color: '#EF826A',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  stepSubtitle: {
    fontSize: 13,
    color: '#766B72',
    marginBottom: 12,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EF826A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#EF826A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#3A2F38',
  },
  scopeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  scopeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F5EFE8',
  },
  scopeChipActive: {
    backgroundColor: '#3A2F38',
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
  scopeChipTextActive: {
    color: '#FFFFFF',
  },
  resultsScrollView: {
    flex: 1,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  resultIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FBF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultEmoji: {
    fontSize: 18,
  },
  resultTextCol: {
    flex: 1,
  },
  resultMainTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  resultSubAddress: {
    fontSize: 12,
    color: '#766B72',
  },
  resultArrow: {
    fontSize: 16,
    color: '#EF826A',
    fontWeight: 'bold',
  },
  manualPinSection: {
    marginTop: 12,
    paddingBottom: 24,
  },
  manualPinOutlineBtn: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF826A',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  manualPinOutlineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF826A',
  },
  pinHeaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
  },
  pinHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 2,
  },
  pinHeaderSubtitle: {
    fontSize: 12,
    color: '#766B72',
    marginBottom: 8,
  },
  reSearchPill: {
    backgroundColor: '#F5EFE8',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reSearchPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF826A',
  },
  miniMapContainer: {
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
  },
  mapBadgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(255, 248, 242, 0.92)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A2F38',
  },
  primaryActionButton: {
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#EF826A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
    marginBottom: 6,
    marginTop: 10,
  },
  subFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3A2F38',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  categoryPill: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: '#F5EFE8',
  },
  categoryPillActive: {
    backgroundColor: '#3A2F38',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A2F38',
  },
  specificFieldsBox: {
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.1)',
  },
  specificBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF826A',
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 8,
  },
  checkboxEmoji: {
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#3A2F38',
    fontWeight: '600',
  },
  invitedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  invitedPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    alignItems: 'center',
  },
  invitedPillActive: {
    backgroundColor: '#EF826A',
    borderColor: '#EF826A',
  },
  invitedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2F38',
  },
  finalSaveButton: {
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EF826A',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  finalSaveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
`;
fs.writeFileSync(path.join(mobileRoot, 'src', 'components', 'map', 'AddPlaceLocationModal.tsx'), addPlaceModalContent, 'utf8');

// 5. app/(tabs)/map/index.tsx
const mapIndexContent = `import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AndreaMap } from '../../../src/components/map/AndreaMap';
import { MapFilters, MapFilterKey, FILTER_TYPE_MAP } from '../../../src/components/map/MapFilters';
import { MapBottomSheet } from '../../../src/components/map/MapBottomSheet';
import { AddPlaceLocationModal } from '../../../src/components/map/AddPlaceLocationModal';
import { PlaceDetailModal } from '../../../src/components/map/PlaceDetailModal';
import { PlaceGalleryModal } from '../../../src/components/map/PlaceGalleryModal';
import { DEMO_MAP_PLACES } from '../../../src/components/map/map.constants';
import { groupMapPlaces, MapPlaceGroup } from '../../../src/features/places/groupMapPlaces';
import { AndreaMapPlace } from '../../../src/types/map';
import { IconPlus, IconLocateFixed } from '../../../src/components/ui/Icons';
import { StorageEngine } from '../../../src/services/storage';
import { CloudSyncEngine } from '../../../src/services/cloud-sync/CloudSyncEngine';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<MapFilterKey>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const [allPlaces, setAllPlaces] = useState<AndreaMapPlace[]>(DEMO_MAP_PLACES);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AndreaMapPlace | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [activeDetailPlace, setActiveDetailPlace] = useState<AndreaMapPlace | null>(null);

  useEffect(() => {
    async function loadPlaces() {
      const saved = await StorageEngine.getItem<AndreaMapPlace[]>('andrea_map_places_v6', DEMO_MAP_PLACES);
      let currentBase = DEMO_MAP_PLACES;
      if (saved && saved.length > 0) {
        const milestoneIds = DEMO_MAP_PLACES.map((p) => p.id);
        const userAddedPlaces = saved.filter((p) => !milestoneIds.includes(p.id));
        currentBase = [...DEMO_MAP_PLACES, ...userAddedPlaces];
      }
      setAllPlaces(currentBase);
      setIsLoaded(true);

      if (CloudSyncEngine.isSupabaseConfigured()) {
        try {
          const cloudState = await CloudSyncEngine.fetchFullCloudState();
          if (cloudState && cloudState.mapPlaces && cloudState.mapPlaces.length > 0) {
            const cloudPlaces: AndreaMapPlace[] = cloudState.mapPlaces.map((mp: any) => ({
              id: mp.id,
              type: mp.category || mp.type || 'memory',
              title: mp.title,
              subtitle: mp.subtitle,
              description: mp.story || mp.description,
              latitude: Number(mp.lat || mp.latitude),
              longitude: Number(mp.lng || mp.longitude),
              precision: mp.locationPrecision || mp.precision || 'exact',
              date: mp.date,
              imageUrl: mp.photos?.[0] || mp.imageUrl,
              photos: mp.photos || (mp.imageUrl ? [mp.imageUrl] : []),
              city: mp.cityName || mp.city,
              formattedAddress: mp.subtitle,
              source: 'google_places',
              verifiedByUser: true,
            }));

            setAllPlaces((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              cloudPlaces.forEach((cp) => map.set(cp.id, cp));
              return Array.from(map.values());
            });
          }
        } catch (e) {
          console.warn('[Map] Cloud hydration error:', e);
        }
      }
    }

    loadPlaces();

    const unsubscribe = CloudSyncEngine.subscribe({
      onEntityChange: (entity, eventType, payload) => {
        if (entity === 'map_places') {
          if (eventType === 'DELETE') {
            setAllPlaces((prev) => prev.filter((p) => p.id !== payload.id));
          } else if (payload) {
            const updatedPlace: AndreaMapPlace = {
              id: payload.id,
              type: payload.category || payload.type || 'memory',
              title: payload.title,
              subtitle: payload.subtitle,
              description: payload.story || payload.description,
              latitude: Number(payload.lat || payload.latitude),
              longitude: Number(payload.lng || payload.longitude),
              precision: payload.locationPrecision || payload.precision || 'exact',
              date: payload.date,
              imageUrl: payload.photos?.[0] || payload.imageUrl,
              photos: payload.photos || (payload.imageUrl ? [payload.imageUrl] : []),
              city: payload.cityName || payload.city,
              formattedAddress: payload.subtitle,
              source: 'google_places',
              verifiedByUser: true,
            };

            setAllPlaces((prev) => {
              const idx = prev.findIndex((p) => p.id === updatedPlace.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updatedPlace;
                return next;
              }
              return [updatedPlace, ...prev];
            });
          }
        }
      },
      onConnectionChange: () => {},
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    StorageEngine.setItem('andrea_map_places_v6', allPlaces);
  }, [allPlaces, isLoaded]);

  const filteredPlaces = useMemo(() => {
    const filterTypes = FILTER_TYPE_MAP[activeFilter];
    if (filterTypes === 'all') return allPlaces;
    return allPlaces.filter((p) => filterTypes.includes(p.type));
  }, [allPlaces, activeFilter]);

  const currentGroups = useMemo(() => {
    return groupMapPlaces(filteredPlaces);
  }, [filteredPlaces]);

  const selectedPlace = useMemo(() => {
    if (!selectedPlaceId) return null;
    return allPlaces.find((p) => p.id === selectedPlaceId) || null;
  }, [allPlaces, selectedPlaceId]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;
    return currentGroups.find((g) => g.id === selectedGroupId) || null;
  }, [currentGroups, selectedGroupId]);

  const filterCounts = useMemo(() => {
    return {
      all: allPlaces.length,
      stages: allPlaces.filter((p) => FILTER_TYPE_MAP.stages.includes(p.type)).length,
      memories: allPlaces.filter((p) => FILTER_TYPE_MAP.memories.includes(p.type)).length,
      dates: allPlaces.filter((p) => FILTER_TYPE_MAP.dates.includes(p.type)).length,
      restaurants: allPlaces.filter((p) => FILTER_TYPE_MAP.restaurants.includes(p.type)).length,
      trips: allPlaces.filter((p) => FILTER_TYPE_MAP.trips.includes(p.type)).length,
      dreams: allPlaces.filter((p) => FILTER_TYPE_MAP.dreams.includes(p.type)).length,
    };
  }, [allPlaces]);

  const handlePlacePress = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('medium');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleGroupPress = useCallback((group: MapPlaceGroup) => {
    triggerHaptic('medium');
    setSelectedPlaceId(null);
    setSelectedGroupId(group.id);
  }, []);

  const handleSelectPlaceFromGroup = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
  }, []);

  const handleCloseSheet = useCallback(() => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  }, []);

  const handleViewDetail = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setActiveDetailPlace(place);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenGallery = useCallback((place: AndreaMapPlace) => {
    triggerHaptic('selection');
    setActiveDetailPlace(place);
    setIsGalleryModalOpen(true);
  }, []);

  const handleAddPhotoToPlace = useCallback((placeId: string, newPhotoUrl: string) => {
    setAllPlaces((prev) => {
      const idx = prev.findIndex((p) => p.id === placeId);
      if (idx >= 0) {
        const place = prev[idx];
        const updatedPhotos = Array.from(new Set([...(place.photos || []), newPhotoUrl]));
        const updatedPlace: AndreaMapPlace = {
          ...place,
          imageUrl: place.imageUrl || newPhotoUrl,
          photos: updatedPhotos,
        };
        const next = [...prev];
        next[idx] = updatedPlace;
        if (activeDetailPlace && activeDetailPlace.id === placeId) {
          setActiveDetailPlace(updatedPlace);
        }
        CloudSyncEngine.syncMapPlace(updatedPlace);
        return next;
      }
      return prev;
    });
  }, [activeDetailPlace]);

  const handleOpenAddModal = () => {
    triggerHaptic('light');
    setEditingPlace(null);
    setIsAddModalOpen(true);
  };

  const handleEditLocation = (place: AndreaMapPlace) => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
    setIsDetailModalOpen(false);
    setEditingPlace(place);
    setIsAddModalOpen(true);
  };

  const handleSaveVerifiedPlace = (place: AndreaMapPlace) => {
    setAllPlaces((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === place.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = place;
        return next;
      }
      return [place, ...prev];
    });
    setSelectedGroupId(null);
    setSelectedPlaceId(place.id);
    setEditingPlace(null);
    CloudSyncEngine.syncMapPlace(place);
  };

  const handleRecenter = () => {
    triggerHaptic('light');
    setSelectedPlaceId(null);
    setSelectedGroupId(null);
  };

  const topOffset = Math.max(insets.top + 6, 12);
  const isSheetOpen = Boolean(selectedPlace || selectedGroup);

  return (
    <View style={styles.container}>
      <AndreaMap
        places={filteredPlaces}
        selectedPlaceId={selectedPlaceId}
        selectedGroupId={selectedGroupId}
        onPlacePress={handlePlacePress}
        onGroupPress={handleGroupPress}
      />

      <MapFilters
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          triggerHaptic('selection');
          setActiveFilter(filter);
          setSelectedPlaceId(null);
          setSelectedGroupId(null);
        }}
        counts={filterCounts}
        topOffset={topOffset}
      />

      <View style={styles.floatingControls}>
        <TouchableOpacity
          style={styles.controlCircleBtn}
          activeOpacity={0.85}
          onPress={handleRecenter}
          accessibilityLabel="Centrar mapa en Valencia"
        >
          <IconLocateFixed size={18} color="#3A2F38" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {!isSheetOpen && (
        <View style={styles.creationCtaWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.creationCtaPill}
            activeOpacity={0.85}
            onPress={handleOpenAddModal}
            accessibilityLabel="Guardar momento en el mapa"
          >
            <IconPlus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.creationCtaText}>Guardar momento</Text>
          </TouchableOpacity>
        </View>
      )}

      <MapBottomSheet
        place={selectedPlace}
        group={selectedGroup}
        onClose={handleCloseSheet}
        onViewDetail={handleViewDetail}
        onEditLocation={handleEditLocation}
        onOpenGallery={handleOpenGallery}
        onSelectPlaceFromGroup={handleSelectPlaceFromGroup}
      />

      <PlaceDetailModal
        visible={isDetailModalOpen}
        place={activeDetailPlace}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenGallery={handleOpenGallery}
        onEditPlace={handleEditLocation}
      />

      <PlaceGalleryModal
        visible={isGalleryModalOpen}
        place={activeDetailPlace}
        onClose={() => setIsGalleryModalOpen(false)}
        onAddPhoto={handleAddPhotoToPlace}
      />

      <AddPlaceLocationModal
        visible={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlace(null);
        }}
        onSavePlace={handleSaveVerifiedPlace}
        initialPlace={editingPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
    width: '100%',
    height: '100%',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: 76,
    gap: 8,
    zIndex: 20,
  },
  controlCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    shadowColor: '#3A2F38',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  creationCtaWrapper: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  creationCtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF826A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    shadowColor: '#EF826A',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  creationCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
  },
});
`;
fs.writeFileSync(path.join(mobileRoot, 'app', '(tabs)', 'map', 'index.tsx'), mapIndexContent, 'utf8');

console.log('✅ Applied PlaceGalleryModal, PlaceDetailModal, MapBottomSheet, AddPlaceLocationModal, and map/index.tsx');
