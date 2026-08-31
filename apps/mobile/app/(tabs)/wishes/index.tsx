import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { TiltedCard } from '../../../src/components/ui/TiltedCard';
import { StaggeredItem } from '../../../src/components/ui/StaggeredList';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { PhotoUploadField } from '../../../src/components/ui/PhotoUploadField';
import { IconSparkles } from '../../../src/components/ui/Icons';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows } from '../../../src/theme/tokens';
import { WishlistItem, WishlistStatus, WishlistItemType, Place } from '@andrea/types';
import { extractLinkMetadata } from '../../../src/utils/linkMetadata';
import { triggerHaptic } from '../../../src/utils/haptics';
import { AddWishWizardModal, NewWishData } from '../../../src/components/wishes/AddWishWizardModal';
import { CreateSurpriseFlow } from '../../../src/features/calendar/components/CreateSurpriseFlow';
import { SurpriseCreationPayload } from '../../../src/features/calendar/domain/calendar.types';

type TabFilter = 'all' | 'restaurants' | 'fashion' | 'trips' | 'home' | 'fulfilled';

export default function WishesScreen() {
  const router = useRouter();
  const {
    wishes,
    savedPlaces,
    currentDevUser,
    partnerDevUser,
    addWish,
    updateWishStatus,
    convertWishToSurprise,
    convertWishToMemory,
    deleteWish,
    addSavedPlace,
    convertPlaceToEvent,
    addCoupleEvent,
    addSurprise,
  } = useDev();

  const [activeFilter, setActiveFilter] = useState<TabFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedWishForFulfill, setSelectedWishForFulfill] = useState<WishlistItem | null>(null);
  const [fulfillStory, setFulfillStory] = useState('');
  const [fulfillPhotoUrl, setFulfillPhotoUrl] = useState('');
  const [selectedRestaurantPlace, setSelectedRestaurantPlace] = useState<Place | null>(null);

  const [isSurpriseFlowOpen, setIsSurpriseFlowOpen] = useState(false);
  const [surpriseWishTarget, setSurpriseWishTarget] = useState<WishlistItem | null>(null);

  const handleScheduleRestaurantDate = (placeOrWish: { id?: string; name?: string; title?: string; phoneNumber?: string; city?: string }) => {
    triggerHaptic('medium');
    const name = placeOrWish.name || placeOrWish.title || 'Restaurante';
    const rawPhone =
      placeOrWish.phoneNumber ||
      (name.toLowerCase().includes('don salvatore')
        ? '+34 963 74 82 90'
        : name.toLowerCase().includes('kibo')
        ? '+34 914 35 12 89'
        : name.toLowerCase().includes('trattoria')
        ? '+39 06 6880 1234'
        : name.toLowerCase().includes('flore')
        ? '+33 1 45 48 55 26'
        : name.toLowerCase().includes('mirador')
        ? '+34 958 22 14 56'
        : undefined);

    if (placeOrWish.id) {
      convertPlaceToEvent(placeOrWish.id, '2026-09-05', '21:00');
    }

    if (rawPhone) {
      const cleanPhone = rawPhone.replace(/[^\d+]/g, '');
      Linking.openURL(`tel:${cleanPhone}`).catch(() => {
        Alert.alert(
          'Teléfono del Restaurante',
          `Número de contacto para ${name}: ${rawPhone}\n\nLa cita para cenar ha sido guardada en vuestro Calendario.`
        );
      });
      Alert.alert(
        '📞 Llamando para Reservar',
        `Abriendo el teléfono para llamar a ${name} (${rawPhone}) y agendando la cita en vuestro Calendario de pareja.`
      );
    } else {
      Alert.alert(
        '📅 Cita Agendada',
        `Cena en ${name} programada en vuestro Calendario para el próximo fin de semana.`
      );
    }
  };

  // Filtered List
  const filteredWishes = useMemo(() => {
    return wishes.filter((w) => {
      if (activeFilter === 'fulfilled') return w.status === 'fulfilled';
      if (w.status === 'fulfilled' && activeFilter !== 'all') return false;
      if (activeFilter === 'restaurants') return w.type === 'restaurant';
      if (activeFilter === 'fashion') return w.type === 'fashion' || w.type === 'beauty';
      if (activeFilter === 'trips') return w.type === 'trip' || w.type === 'experience';
      if (activeFilter === 'home') return w.type === 'home' || w.type === 'other';
      return true;
    });
  }, [wishes, activeFilter]);

  const restaurantPlaces = useMemo(() => {
    return savedPlaces.filter((p) => p.category === 'restaurant' || p.category === 'cafe' || p.category === 'bar');
  }, [savedPlaces]);

  const handleSaveWishFromWizard = async (data: NewWishData) => {
    triggerHaptic('heavy');

    await addWish({
      title: data.title,
      description: data.description,
      sourceUrl: data.sourceUrl,
      externalImageUrl: data.externalImageUrl,
      images: data.images,
      type: data.type,
      status: data.status,
      brand: data.brand,
      storeName: data.storeName,
      estimatedPrice: data.estimatedPrice,
      isForSelf: data.isForSelf,
      phoneNumber: data.phoneNumber,
      color: data.color,
      occasion: data.occasion,
    });

    // If it's a restaurant, also optionally create a Place
    if (data.type === 'restaurant') {
      addSavedPlace({
        name: data.title,
        category: 'restaurant',
        status: 'want_to_go',
        note: data.description || (data.occasion ? `Cocina: ${data.occasion}` : undefined),
        coverImageUrl: data.externalImageUrl,
        phoneNumber: data.phoneNumber,
        city: data.brand || 'Valencia',
      });
    }

    Alert.alert('✨ Deseo Guardado', `"${data.title}" se ha añadido a vuestro catálogo de ilusiones.`);
  };

  const handleOpenFulfill = (wish: WishlistItem) => {
    setSelectedWishForFulfill(wish);
    setFulfillStory(`Hicimos realidad este deseo juntos. Un momento inolvidable.`);
    setFulfillPhotoUrl(wish.externalImageUrl || '');
    setIsFulfillModalOpen(true);
  };

  const handleConfirmFulfill = () => {
    if (!selectedWishForFulfill) return;
    convertWishToMemory(selectedWishForFulfill.id, fulfillStory, fulfillPhotoUrl);
    setIsFulfillModalOpen(false);
    setSelectedWishForFulfill(null);
    Alert.alert('✨ ¡Deseo Cumplido!', 'Se ha guardado como un Recuerdo eterno en vuestro Mapa y Línea Temporal.');
  };

  const handleMakeSurprise = (wish: WishlistItem) => {
    triggerHaptic('selection');
    setSurpriseWishTarget(wish);
    setIsSurpriseFlowOpen(true);
  };

  const handleSaveSurpriseFromWish = (payload: SurpriseCreationPayload) => {
    if (!surpriseWishTarget) return;

    // 1. Calculate revealAt if custom_date
    let calculatedRevealAt: string | undefined = undefined;
    if (payload.revealOption === 'custom_date' && payload.revealDate) {
      calculatedRevealAt = `${payload.revealDate}T${payload.revealTime || '12:00'}:00`;
    } else if (payload.revealOption === 'one_day_before') {
      calculatedRevealAt = `${payload.date}T00:00:00`;
    } else if (payload.revealOption === 'same_day_morning') {
      calculatedRevealAt = `${payload.date}T09:00:00`;
    } else if (payload.revealOption === 'specific_time') {
      calculatedRevealAt = `${payload.date}T${payload.time}:00`;
    }

    // 2. Add couple event
    addCoupleEvent({
      eventType: 'surprise',
      date: payload.date,
      time: payload.time,
      title: payload.title,
      subtitle: payload.location ? `En ${payload.location}` : 'Plan secreto con amor',
      location: payload.location,
      notes: payload.notes,
      isSecret: true,
      revealPolicy: payload.revealOption === 'now' ? 'immediately' : 'scheduled',
      revealAt: calculatedRevealAt,
      surpriseCategory: payload.category,
      linkedWishlistId: surpriseWishTarget.id,
    });

    // 3. Mark wish in progress
    updateWishStatus(surpriseWishTarget.id, 'in_progress');

    // 4. Create surprise entry in diary/surprises
    addSurprise({
      date: payload.date,
      content: {
        title: payload.title,
        description: payload.notes?.join(' · ') || `Sorpresa para cumplir el deseo: ${surpriseWishTarget.title}`,
        status: 'comprando',
        occasion: 'sin_ocasión',
        category: payload.category,
        purchaseDetails: {
          purchasedAt: new Date().toISOString().split('T')[0],
          purchasedBy: currentDevUser.id,
          productUrl: surpriseWishTarget.sourceUrl,
          price: surpriseWishTarget.estimatedPrice,
        }
      } as any,
    });

    setIsSurpriseFlowOpen(false);
    setSurpriseWishTarget(null);
    Alert.alert('🎁 ¡Sorpresa Preparada!', `Has agendado "${payload.title}" en secreto para ${partnerDevUser.name}.`);
  };

  const getStatusBadge = (status: WishlistStatus) => {
    switch (status) {
      case 'dreaming':
        return <Badge variant="primary">Me hace ilusión</Badge>;
      case 'considering':
        return <Badge variant="secondary">En consideración</Badge>;
      case 'planned':
        return <Badge variant="butter">Ocasión especial</Badge>;
      case 'someday':
        return <Badge variant="mistBlue">Algún día</Badge>;
      case 'in_progress':
        return <Badge variant="sage">En camino</Badge>;
      case 'fulfilled':
        return <Badge variant="neutral">Hecho realidad</Badge>;
      default:
        return <Badge variant="neutral">Deseo</Badge>;
    }
  };

  return (
    <ScreenWrapper>
      {/* HEADER EDITORIAL */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Sorpresas y Deseos</Text>
          <Text style={styles.headerSubtitle}>Para ahora, para después o para algún día</Text>
        </View>
        <TouchableOpacity
          style={styles.btnQuickAdd}
          activeOpacity={0.85}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Text style={styles.btnQuickAddText}>+ Guardar deseo</Text>
        </TouchableOpacity>
      </View>

      {/* FILTER PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'all' && styles.filterChipTextActive]}>
            Todos ({wishes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'restaurants' && styles.filterChipActive]}
          onPress={() => setActiveFilter('restaurants')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'restaurants' && styles.filterChipTextActive]}>
            Restaurantes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'fashion' && styles.filterChipActive]}
          onPress={() => setActiveFilter('fashion')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'fashion' && styles.filterChipTextActive]}>
            Moda & Belleza
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'trips' && styles.filterChipActive]}
          onPress={() => setActiveFilter('trips')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'trips' && styles.filterChipTextActive]}>
            Viajes & Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'home' && styles.filterChipActive]}
          onPress={() => setActiveFilter('home')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'home' && styles.filterChipTextActive]}>
            Hogar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, activeFilter === 'fulfilled' && styles.filterChipActive]}
          onPress={() => setActiveFilter('fulfilled')}
        >
          <Text style={[styles.filterChipText, activeFilter === 'fulfilled' && styles.filterChipTextActive]}>
            Cumplidos
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {/* WISHES LIST */}
      <View style={styles.sectionBlock}>
        <SectionHeader
          title={activeFilter === 'fulfilled' ? 'Deseos Hechos Realidad' : 'Lista de Ilusiones'}
          subtitle={
            activeFilter === 'fulfilled'
              ? 'Momentos y regalos que ya forman parte de vuestra memoria'
              : 'Detalles, experiencias y caprichos que queréis vivir o regalar'
          }
        />

        {filteredWishes.length === 0 ? (
          <EmptyState
            title="El rincón de los deseos está esperando"
            subtitle="Guarda una prenda, un perfume, una cena especial o un plan soñado sin complicaciones."
            actionText="+ Guardar primer deseo"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <View style={styles.wishesGrid}>
            {filteredWishes.map((wish, index) => {
              const isOwner = wish.ownerUserId === currentDevUser.id;
              const ownerName = isOwner ? 'Tú' : partnerDevUser.name;

              return (
                <StaggeredItem key={wish.id} index={index}>
                  <TiltedCard style={styles.wishCard} variant="elevated">
                    {/* MULTI-PHOTO GALLERY OR SINGLE IMAGE */}
                    {wish.images && wish.images.length > 1 ? (
                      <View style={styles.wishGalleryWrapper}>
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          style={styles.wishCardGalleryScroll}
                        >
                          {wish.images.map((img, i) => (
                            <Image key={i} source={{ uri: img }} style={styles.wishCardGalleryImage} />
                          ))}
                        </ScrollView>
                        <View style={styles.galleryCountPill}>
                          <Text style={styles.galleryCountText}>✦ {wish.images.length} fotos</Text>
                        </View>
                      </View>
                    ) : (
                      (wish.externalImageUrl || (wish.images && wish.images[0])) && (
                        <Image
                          source={{ uri: wish.externalImageUrl || (wish.images && wish.images[0]) }}
                          style={styles.wishCardImage}
                        />
                      )
                    )}

                    <View style={styles.wishCardContent}>
                      <View style={styles.wishTopRow}>
                        <View style={styles.wishBadgeRow}>
                          {getStatusBadge(wish.status)}
                          <Badge
                            variant={isOwner ? 'neutral' : 'secondary'}
                          >
                            {wish.isForSelf ? 'Para mí' : `De ${ownerName}`}
                          </Badge>
                        </View>
                        {wish.estimatedPrice && (
                          <Text style={styles.wishPriceTag}>{wish.estimatedPrice}€</Text>
                        )}
                      </View>

                      <Text style={styles.wishTitle}>{wish.title}</Text>
                      {wish.description && (
                        <Text style={styles.wishDescription}>{wish.description}</Text>
                      )}

                      <View style={styles.wishMetaRow}>
                        {wish.brand && <Text style={styles.wishBrandTag}>{wish.brand}</Text>}
                        {wish.sourceDomain && (
                          <Text style={styles.wishDomainTag}>{wish.sourceDomain}</Text>
                        )}
                        {wish.occasion && (
                          <Text style={styles.wishOccasionTag}>{wish.occasion}</Text>
                        )}
                      </View>

                      {/* ACTIONS */}
                      {wish.status !== 'fulfilled' && (
                        <View style={styles.wishActionFooter}>
                          {wish.type === 'restaurant' && (
                            <TouchableOpacity
                              style={[
                                styles.btnSurpriseTrigger,
                                { backgroundColor: Colors.light.primary + '15', borderColor: Colors.light.primary + '40' }
                              ]}
                              activeOpacity={0.8}
                              onPress={() => handleScheduleRestaurantDate(wish)}
                            >
                              <Text style={[styles.btnSurpriseTriggerText, { color: Colors.light.primary }]}>
                                📞 Llamar & Agendar
                              </Text>
                            </TouchableOpacity>
                          )}

                          {/* If it belongs to partner, option to make a surprise */}
                          {!isOwner && (
                            <TouchableOpacity
                              style={styles.btnSurpriseTrigger}
                              activeOpacity={0.8}
                              onPress={() => handleMakeSurprise(wish)}
                            >
                              <Text style={styles.btnSurpriseTriggerText}>Hacerle la sorpresa</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            style={styles.btnFulfillTrigger}
                            activeOpacity={0.8}
                            onPress={() => handleOpenFulfill(wish)}
                          >
                            <Text style={styles.btnFulfillTriggerText}>Se hizo realidad</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TiltedCard>
                </StaggeredItem>
              );
            })}
          </View>
        )}
      </View>

      {/* MULTI-STEP WISH WIZARD MODAL */}
      <AddWishWizardModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveWish={handleSaveWishFromWizard}
      />

      {/* FULFILL / MAKE MEMORY MODAL */}
      <Modal visible={isFulfillModalOpen} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Se hizo realidad</Text>
                <Text style={styles.modalSubtitle}>Convierte este deseo en un recuerdo para siempre</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFulfillModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.fulfillWishName}>{selectedWishForFulfill?.title}</Text>

              <Text style={styles.inputLabel}>Historia o dedicatoria del momento</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="ej. Me lo regaló por nuestro aniversario. Nos encantó celebrarlo juntos..."
                placeholderTextColor={Colors.light.textMuted}
                value={fulfillStory}
                onChangeText={setFulfillStory}
                multiline
                numberOfLines={4}
              />

              <PhotoUploadField
                imageUri={fulfillPhotoUrl}
                onImageChange={(val) => setFulfillPhotoUrl(val || '')}
                label="Foto del recuerdo"
                placeholderText="Toca para subir la foto de este momento cumplido"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: 'rgba(28, 25, 23, 0.06)',
                  marginRight: 8,
                }}
                onPress={() => setIsFulfillModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.light.textSecondary }}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: Colors.light.sage || '#5F8575',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleConfirmFulfill}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Guardar como Recuerdo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* RESTAURANT DETAIL & MEMORY HISTORY MODAL */}
      <Modal
        visible={!!selectedRestaurantPlace}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRestaurantPlace(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.restaurantDetailCard]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: Spacing.sm }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedRestaurantPlace?.name}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedRestaurantPlace?.city} · {selectedRestaurantPlace?.cuisine?.join(', ')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedRestaurantPlace(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Photo Carousel or Cover Image */}
              {selectedRestaurantPlace?.photos && selectedRestaurantPlace.photos.length > 1 ? (
                <View style={styles.restaurantDetailGalleryWrap}>
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.restaurantGalleryScroll}
                  >
                    {selectedRestaurantPlace.photos.map((photo, i) => (
                      <Image
                        key={i}
                        source={{ uri: photo }}
                        style={styles.restaurantGalleryPhoto}
                      />
                    ))}
                  </ScrollView>
                  <View style={styles.galleryBadgeOverlay}>
                    <Text style={styles.galleryBadgeOverlayText}>
                      ✦ {selectedRestaurantPlace.photos.length} fotos reales
                    </Text>
                  </View>
                </View>
              ) : (
                selectedRestaurantPlace?.coverImageUrl && (
                  <Image
                    source={{ uri: selectedRestaurantPlace.coverImageUrl }}
                    style={styles.restaurantDetailCoverPhoto}
                  />
                )
              )}

              {/* Status and Rating Badges */}
              <View style={styles.restaurantBadgeRow}>
                <View style={styles.ratingStarsBox}>
                  <Text style={styles.ratingStarsText}>⭐⭐⭐⭐⭐ 5.0</Text>
                </View>
                <Badge variant={selectedRestaurantPlace?.status === 'favorite' ? 'butter' : 'neutral'}>
                  {selectedRestaurantPlace?.status === 'favorite'
                    ? '⭐ Favorito de siempre'
                    : selectedRestaurantPlace?.status === 'want_to_go'
                    ? '💫 Pendiente / Deseo'
                    : '✓ Visitado'}
                </Badge>
                {selectedRestaurantPlace?.vibe && (
                  <Badge variant="secondary">
                    {selectedRestaurantPlace.vibe === 'romantico'
                      ? '🌹 Romántico'
                      : selectedRestaurantPlace.vibe === 'celebracion'
                      ? '🍾 Celebración'
                      : '🌿 Tranquilo'}
                  </Badge>
                )}
                <Text style={styles.restaurantPriceTag}>
                  {'€'.repeat(selectedRestaurantPlace?.priceLevel || 2)}
                </Text>
              </View>

              {/* Google Maps & Action Buttons */}
              <View style={styles.externalActionsRow}>
                <TouchableOpacity
                  style={styles.btnGoogleMaps}
                  onPress={() => {
                    triggerHaptic('medium');
                    const url =
                      selectedRestaurantPlace?.googleMapsUrl ||
                      `https://maps.google.com/?q=${encodeURIComponent(
                        `${selectedRestaurantPlace?.name} ${selectedRestaurantPlace?.address || selectedRestaurantPlace?.city || 'Valencia'}`
                      )}`;
                    Linking.openURL(url);
                  }}
                >
                  <Text style={styles.btnGoogleMapsText}>🗺️ Abrir en Google Maps</Text>
                </TouchableOpacity>

                {selectedRestaurantPlace?.phoneNumber && (
                  <TouchableOpacity
                    style={styles.btnCallPhone}
                    onPress={() => {
                      triggerHaptic('medium');
                      Linking.openURL(`tel:${selectedRestaurantPlace.phoneNumber}`);
                    }}
                  >
                    <Text style={styles.btnCallPhoneText}>📞 Llamar ({selectedRestaurantPlace.phoneNumber})</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Exact Address */}
              {selectedRestaurantPlace?.address && (
                <View style={styles.addressBox}>
                  <Text style={styles.addressLabel}>📍 Dirección exacta</Text>
                  <Text style={styles.addressText}>{selectedRestaurantPlace.address}</Text>
                </View>
              )}

              {/* Personal Story & Note */}
              {selectedRestaurantPlace?.note && (
                <View style={styles.storyBox}>
                  <Text style={styles.storyLabel}>✨ Nuestra Historia & Notas</Text>
                  <Text style={styles.storyText}>"{selectedRestaurantPlace.note}"</Text>
                </View>
              )}

              {/* VISITS AND SPECIAL MOMENTS HISTORY */}
              {selectedRestaurantPlace?.visits && selectedRestaurantPlace.visits.length > 0 && (
                <View style={styles.visitsSection}>
                  <Text style={styles.visitsSectionTitle}>
                    ❤️ Visitas & Momentos Compartidos ({selectedRestaurantPlace.visits.length})
                  </Text>
                  {selectedRestaurantPlace.visits.map((v) => (
                    <View key={v.id} style={styles.visitItemCard}>
                      <View style={styles.visitDateBadge}>
                        <Text style={styles.visitDateBadgeText}>{v.date}</Text>
                      </View>
                      <View style={styles.visitDetailsCol}>
                        <Text style={styles.visitItemTitle}>{v.title}</Text>
                        {v.note && <Text style={styles.visitItemNote}>{v.note}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.modalFooter}>
              <Button
                variant="ghost"
                onPress={() => setSelectedRestaurantPlace(null)}
              >
                Cerrar
              </Button>
              <Button
                variant="primary"
                onPress={() => {
                  if (selectedRestaurantPlace) {
                    handleScheduleRestaurantDate(selectedRestaurantPlace);
                  }
                  setSelectedRestaurantPlace(null);
                }}
              >
                🗓️ Agendar en Calendario
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* SURPRISE CREATION FLOW FOR WISH */}
      <CreateSurpriseFlow
        visible={isSurpriseFlowOpen}
        onClose={() => {
          setIsSurpriseFlowOpen(false);
          setSurpriseWishTarget(null);
        }}
        onSuccess={handleSaveSurpriseFromWish}
        initialTitle={surpriseWishTarget ? `Sorpresa: ${surpriseWishTarget.title}` : undefined}
        initialCategory={
          surpriseWishTarget?.type === 'restaurant'
            ? 'cena'
            : surpriseWishTarget?.type === 'trip'
            ? 'escapada'
            : 'regalo'
        }
        initialLocation={surpriseWishTarget?.brand || surpriseWishTarget?.storeName}
        initialNotes={
          surpriseWishTarget?.sourceUrl
            ? `Enlace del deseo: ${surpriseWishTarget.sourceUrl}`
            : undefined
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingRight: 52,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: Spacing.md
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  btnQuickAdd: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    ...Shadows.sm
  },
  btnQuickAddText: {
    color: Colors.light.textInverse,
    fontWeight: '600',
    fontSize: 13
  },
  filterScroll: {
    paddingBottom: Spacing.md,
    gap: Spacing.xs
  },
  filterChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.xs
  },
  filterChipActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.light.textSecondary
  },
  filterChipTextActive: {
    color: Colors.light.textInverse,
    fontWeight: '600'
  },
  sectionBlock: {
    marginTop: Spacing.lg
  },
  restaurantsScroll: {
    paddingVertical: Spacing.xs,
    gap: Spacing.md
  },
  restaurantMiniCard: {
    width: 250,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    padding: 0
  },
  restaurantMiniImg: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.light.surfaceSubtle
  },
  restaurantMiniInfo: {
    padding: Spacing.md
  },
  restaurantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
    marginRight: Spacing.xs
  },
  restaurantPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.sage
  },
  restaurantMeta: {
    fontSize: 11.5,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  restaurantNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.light.textMuted,
    marginTop: 6,
    lineHeight: 15
  },
  restaurantActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md
  },
  restaurantActionBtn: {
    flex: 1,
    backgroundColor: Colors.light.surfaceSubtle,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    alignItems: 'center'
  },
  restaurantActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text
  },
  restaurantActionSecret: {
    backgroundColor: Colors.light.secondaryLight
  },
  restaurantActionSecretText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.secondaryDark
  },
  wishesGrid: {
    gap: Spacing.md,
    marginTop: Spacing.sm
  },
  wishCard: {
    borderRadius: Radii.xl,
    overflow: 'hidden',
    padding: 0
  },
  wishCardImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.light.surfaceSubtle
  },
  wishCardContent: {
    padding: Spacing.lg
  },
  wishTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  wishBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs
  },
  wishPriceTag: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text
  },
  wishTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    lineHeight: 22
  },
  wishDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
    lineHeight: 18
  },
  wishMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.md
  },
  wishBrandTag: {
    fontSize: 11.5,
    color: Colors.light.textMuted,
    backgroundColor: Colors.light.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm
  },
  wishDomainTag: {
    fontSize: 11.5,
    color: Colors.light.mistBlueDark,
    backgroundColor: Colors.light.mistBlueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm
  },
  wishOccasionTag: {
    fontSize: 11.5,
    color: Colors.light.butterDark,
    backgroundColor: Colors.light.butterLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm
  },
  wishActionFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  btnSurpriseTrigger: {
    flex: 1,
    backgroundColor: Colors.light.secondaryLight,
    paddingVertical: 9,
    borderRadius: Radii.md,
    alignItems: 'center'
  },
  btnSurpriseTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.secondaryDark
  },
  btnFulfillTrigger: {
    flex: 1,
    backgroundColor: Colors.light.sageLight,
    paddingVertical: 9,
    borderRadius: Radii.md,
    alignItems: 'center'
  },
  btnFulfillTriggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.sageDark
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 41, 0.45)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(253, 252, 250, 0.88)' : Colors.light.surface,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        } as any)
      : {}),
    borderTopLeftRadius: 4, // Squared corners
    borderTopRightRadius: 4, // Squared corners
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    padding: Spacing.xl,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.light.text
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.light.textMuted,
    padding: Spacing.xs
  },
  modalBody: {
    marginBottom: Spacing.lg
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 4,
    marginTop: Spacing.sm
  },
  textInput: {
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.light.text
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top'
  },
  toggleAdvancedBtn: {
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs
  },
  toggleAdvancedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary
  },
  advancedSection: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  choiceChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs
  },
  choiceChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  choiceChipActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary
  },
  choiceChipText: {
    fontSize: 11.5,
    color: Colors.light.textSecondary
  },
  choiceChipTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: '600'
  },
  rowTwoInputs: {
    flexDirection: 'row',
    marginTop: Spacing.xs
  },
  extractingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: Spacing.xs,
  },
  extractingText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  autocompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(196, 112, 137, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radii.md,
    marginTop: 8,
    marginBottom: 4,
  },
  autocompleteBadgeText: {
    fontSize: 11.5,
    color: Colors.light.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm
  },
  fulfillWishName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.sm
  },
  wishGalleryWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.surfaceSubtle,
  },
  wishCardGalleryScroll: {
    width: '100%',
    height: '100%',
  },
  wishCardGalleryImage: {
    width: 320,
    height: 200,
    resizeMode: 'cover',
  },
  galleryCountPill: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(28, 25, 23, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  galleryCountText: {
    color: '#FFF',
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  gallerySelectorSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  gallerySelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  galleryHint: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontStyle: 'italic',
  },
  galleryScroll: {
    gap: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  galleryThumbCard: {
    position: 'relative',
    width: 76,
    height: 76,
    borderRadius: Radii.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.light.surfaceSubtle,
  },
  galleryThumbCardActive: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(196, 112, 137, 0.92)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  coverBadgeText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  removeThumbBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeThumbText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
  modalCategorySection: {
    marginBottom: Spacing.md,
  },
  categoryChipsScroll: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  categoryChoiceChip: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 4, // Squared clean chip
    backgroundColor: Colors.light.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryChoiceChipActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  categoryChoiceChipText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  categoryChoiceChipTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: '700',
  },
  visitsCountBadge: {
    backgroundColor: 'rgba(224, 86, 102, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  },
  visitsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  restaurantDetailCard: {
    maxHeight: '90%',
    width: '92%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    ...Shadows.lg,
  },
  restaurantDetailGalleryWrap: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: '#1E2430',
  },
  restaurantGalleryScroll: {
    width: '100%',
    height: '100%',
  },
  restaurantGalleryPhoto: {
    width: 340,
    height: 220,
    resizeMode: 'cover',
  },
  galleryBadgeOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(20, 18, 16, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  galleryBadgeOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  restaurantDetailCoverPhoto: {
    width: '100%',
    height: 200,
    borderRadius: Radii.lg,
    resizeMode: 'cover',
    marginBottom: Spacing.md,
  },
  restaurantBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  ratingStarsBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  ratingStarsText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#8A6D1A',
  },
  restaurantPriceTag: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginLeft: 'auto',
  },
  externalActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  btnGoogleMaps: {
    flex: 1,
    backgroundColor: '#1A73E8',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  btnGoogleMapsText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  btnCallPhone: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  btnCallPhoneText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: Colors.light.surfaceSubtle,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  storyBox: {
    backgroundColor: 'rgba(224, 86, 102, 0.05)',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.15)',
  },
  storyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  storyText: {
    fontSize: 13,
    color: Colors.light.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  visitsSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  visitsSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  visitItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF8F5',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  visitDateBadge: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  visitDateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  visitDetailsCol: {
    flex: 1,
  },
  visitItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  visitItemNote: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
