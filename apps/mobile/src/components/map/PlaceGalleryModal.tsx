import React, { useState } from 'react';
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
