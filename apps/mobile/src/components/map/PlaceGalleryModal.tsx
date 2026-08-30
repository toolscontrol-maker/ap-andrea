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
import { IconTrash, IconSparkles, IconPlus } from '../ui/Icons';
import { pickMultipleMediaFromGallery } from '../../utils/imagePicker';

interface PlaceGalleryModalProps {
  visible: boolean;
  place: AndreaMapPlace | null;
  onClose: () => void;
  onAddPhoto: (placeId: string, newPhotoUrl: string) => void;
  onAddMultiplePhotos?: (placeId: string, newPhotoUrls: string[]) => void;
  onRemovePhoto?: (placeId: string, photoUrl: string) => void;
  onReorderPhotos?: (placeId: string, updatedPhotos: string[]) => void;
}

export function PlaceGalleryModal({
  visible,
  place,
  onClose,
  onAddPhoto,
  onAddMultiplePhotos,
  onRemovePhoto,
  onReorderPhotos,
}: PlaceGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  if (!place) return null;

  const allPhotos: string[] = Array.from(
    new Set([
      ...(place.photos || []),
      ...(place.imageUrl ? [place.imageUrl] : []),
    ])
  ).filter(Boolean);

  const handlePickMultiple = async () => {
    try {
      setIsUploading(true);
      setUploadStatus('Seleccionando fotos y vídeos...');
      const picked = await pickMultipleMediaFromGallery({
        quality: 0.92,
        onProgress: (current, total) => {
          setUploadStatus(`Procesando ${current} de ${total} archivos en Ultra HD...`);
        },
      });

      if (!picked || picked.length === 0) {
        setIsUploading(false);
        setUploadStatus('');
        return;
      }

      setUploadStatus(`Guardando ${picked.length} archivos en la nube...`);
      const urls = picked.map((p) => p.base64 || p.uri).filter(Boolean);

      if (onAddMultiplePhotos) {
        await onAddMultiplePhotos(place.id, urls);
      } else {
        for (const u of urls) {
          onAddPhoto(place.id, u);
        }
      }

      triggerHaptic('success');
    } catch (err) {
      console.warn('[Gallery] Multi-upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const isVideoMedia = (url?: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    return (
      url.startsWith('data:video/') ||
      url.endsWith('.mp4') ||
      url.endsWith('.mov') ||
      url.endsWith('.webm') ||
      url.endsWith('.m4v') ||
      url.includes('video')
    );
  };

  const handlePhotoUploaded = (url: string | null) => {
    if (url) {
      triggerHaptic('success');
      onAddPhoto(place.id, url);
    }
  };

  const handleSetAsCover = (photoUrl: string) => {
    triggerHaptic('selection');
    const filtered = allPhotos.filter((p) => p !== photoUrl);
    const updated = [photoUrl, ...filtered];
    if (onReorderPhotos) {
      onReorderPhotos(place.id, updated);
    }
  };

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= allPhotos.length || fromIndex === toIndex) return;
    triggerHaptic('selection');
    const next = [...allPhotos];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    if (onReorderPhotos) {
      onReorderPhotos(place.id, next);
    }
  };

  const confirmDeletePhoto = (photoUrl: string) => {
    triggerHaptic('warning');
    if (Platform.OS === 'web') {
      const ok = window.confirm('¿Quieres eliminar esta fotografía de la galería compartida?');
      if (ok) {
        triggerHaptic('error');
        if (onRemovePhoto) onRemovePhoto(place.id, photoUrl);
        if (selectedImage === photoUrl) setSelectedImage(null);
      }
    } else {
      Alert.alert(
        '🗑️ Eliminar Fotografía',
        '¿Quieres eliminar esta fotografía de la galería compartida?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              triggerHaptic('error');
              if (onRemovePhoto) onRemovePhoto(place.id, photoUrl);
              if (selectedImage === photoUrl) setSelectedImage(null);
            },
          },
        ]
      );
    }
  };

  // Drag and drop handlers for web
  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  };

  const handleDragOver = (e: any) => {
    if (e.preventDefault) e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: any, dropIndex: number) => {
    if (e.preventDefault) e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      handleMovePhoto(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
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
                {allPhotos.length} {allPhotos.length === 1 ? 'fotografía guardada' : 'fotografías guardadas'} · Arrastra o usa las flechas para ordenar
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
              <Text style={styles.uploadCardTitle}>Añadir fotos y vídeos a este rincón</Text>
              <Text style={styles.uploadCardSubtitle}>
                Selecciona una o varias fotos a la vez desde tu galería, cámara o archivos en Ultra HD.
              </Text>

              {isUploading ? (
                <View style={styles.uploadProgressBox}>
                  <Text style={styles.uploadProgressIcon}>✨</Text>
                  <Text style={styles.uploadProgressText}>{uploadStatus || 'Subiendo recuerdos a Supabase...'}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.multiUploadBtn}
                  activeOpacity={0.85}
                  onPress={handlePickMultiple}
                >
                  <IconPlus size={18} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.multiUploadBtnText}>📸 Seleccionar varias fotos / vídeos a la vez</Text>
                </TouchableOpacity>
              )}
            </View>

            {allPhotos.length > 0 ? (
              <View style={styles.photosGridWrapper}>
                {allPhotos.map((photo, index) => {
                  const isCover = index === 0;
                  const isBeingDragged = draggedIndex === index;

                  const cardProps: any = Platform.OS === 'web' ? {
                    draggable: true,
                    onDragStart: (e: any) => handleDragStart(e, index),
                    onDragOver: handleDragOver,
                    onDrop: (e: any) => handleDrop(e, index),
                    onDragEnd: () => setDraggedIndex(null),
                  } : {};

                  return (
                    <View
                      key={photo + '-' + index}
                      style={[
                        styles.photoThumbnailCard,
                        isCover && styles.photoThumbnailCardCover,
                        isBeingDragged && styles.photoThumbnailDragging,
                      ]}
                      {...cardProps}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.imageTapArea}
                        onPress={() => {
                          triggerHaptic('selection');
                          setSelectedImage(photo);
                        }}
                      >
                        {isVideoMedia(photo) ? (
                          <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                            <video
                              src={photo}
                              autoPlay
                              loop
                              muted
                              playsInline
                              style={{ width: '100%', height: '100%', objectFit: 'cover' } as any}
                            />
                            <View style={styles.videoBadge}>
                              <Text style={styles.videoBadgeText}>▶ VÍDEO</Text>
                            </View>
                          </View>
                        ) : (
                          <Image source={{ uri: photo }} style={styles.photoThumbnail} resizeMode="cover" />
                        )}
                      </TouchableOpacity>

                      {/* Header Badge Overlay: Cover or Photo index */}
                      <View style={styles.cardTopBar}>
                        {isCover ? (
                          <View style={styles.coverBadge}>
                            <Text style={styles.coverBadgeText}>⭐ Portada</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.setCoverBtn}
                            activeOpacity={0.8}
                            onPress={() => handleSetAsCover(photo)}
                          >
                            <Text style={styles.setCoverBtnText}>⭐ Hacer portada</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.deletePhotoBtn}
                          activeOpacity={0.7}
                          onPress={() => confirmDeletePhoto(photo)}
                          accessibilityLabel="Eliminar fotografía"
                        >
                          <IconTrash size={13} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>

                      {/* Bottom Controls Bar: Reorder buttons & Position indicator */}
                      <View style={styles.cardBottomBar}>
                        <View style={styles.reorderGroup}>
                          {index > 0 && (
                            <TouchableOpacity
                              style={styles.arrowBtn}
                              activeOpacity={0.7}
                              onPress={() => handleMovePhoto(index, index - 1)}
                              accessibilityLabel="Mover hacia la izquierda"
                            >
                              <Text style={styles.arrowBtnText}>◀</Text>
                            </TouchableOpacity>
                          )}
                          {index < allPhotos.length - 1 && (
                            <TouchableOpacity
                              style={styles.arrowBtn}
                              activeOpacity={0.7}
                              onPress={() => handleMovePhoto(index, index + 1)}
                              accessibilityLabel="Mover hacia la derecha"
                            >
                              <Text style={styles.arrowBtnText}>▶</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={styles.photoBadgeOverlay}>
                          <Text style={styles.photoBadgeText}>#{index + 1}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyGalleryCard}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyTitle}>Aún no hay fotos o vídeos subidos</Text>
                <Text style={styles.emptySubtitle}>
                  Sé el primero en subir fotos o vídeos de este lugar inolvidable
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
              <View style={styles.lightboxTopBar}>
                <Text style={styles.lightboxCounter}>
                  {isVideoMedia(selectedImage) ? '🎬 Vídeo' : 'Foto'} {allPhotos.indexOf(selectedImage) + 1} de {allPhotos.length}
                </Text>
                <TouchableOpacity
                  style={styles.lightboxCloseBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.lightboxCloseText}>✕ Cerrar</Text>
                </TouchableOpacity>
              </View>

              {isVideoMedia(selectedImage) ? (
                <video
                  src={selectedImage}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '92%', maxHeight: '72%', borderRadius: 16, outline: 'none' } as any}
                />
              ) : (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.lightboxImage}
                  resizeMode="contain"
                />
              )}

              <View style={styles.lightboxActionsBar}>
                {allPhotos.indexOf(selectedImage) !== 0 && (
                  <TouchableOpacity
                    style={styles.lightboxCoverAction}
                    activeOpacity={0.8}
                    onPress={() => {
                      handleSetAsCover(selectedImage);
                      setSelectedImage(null);
                    }}
                  >
                    <IconSparkles size={15} color="#3A2F38" />
                    <Text style={styles.lightboxCoverActionText}>Poner de portada</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.lightboxDeleteAction}
                  activeOpacity={0.8}
                  onPress={() => confirmDeletePhoto(selectedImage)}
                >
                  <IconTrash size={15} color="#FFFFFF" />
                  <Text style={styles.lightboxDeleteActionText}>Eliminar foto</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 14,
  },
  multiUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF826A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#EF826A',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  multiUploadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDF8E8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F4C95D',
  },
  uploadProgressIcon: {
    fontSize: 16,
  },
  uploadProgressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8A6208',
  },
  photosGridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoThumbnailCard: {
    width: (screenWidth > 680 ? 680 : screenWidth - 52) / 2 - 6,
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5EFE8',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    ...(Platform.OS === 'web' ? { cursor: 'grab', userSelect: 'none' } : {}),
  } as any,
  photoThumbnailCardCover: {
    borderColor: '#F4C95D',
    shadowColor: '#F4C95D',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photoThumbnailDragging: {
    opacity: 0.45,
    transform: [{ scale: 0.96 }],
  },
  imageTapArea: {
    width: '100%',
    height: '100%',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  cardTopBar: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  coverBadge: {
    backgroundColor: '#F4C95D',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3A2F38',
  },
  setCoverBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  setCoverBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deletePhotoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(217, 67, 84, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardBottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  reorderGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowBtn: {
    width: 26,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  photoBadgeOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
    paddingHorizontal: 16,
  },
  lightboxTopBar: {
    position: 'absolute',
    top: 44,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  lightboxCounter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lightboxCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  lightboxCloseText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  lightboxImage: {
    width: '100%',
    height: '75%',
  },
  lightboxActionsBar: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  lightboxCoverAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4C95D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  lightboxCoverActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3A2F38',
  },
  lightboxDeleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D94354',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  lightboxDeleteActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoBadge: {
    position: 'absolute',
    top: 8,
    right: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  videoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
