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
    convertPlaceToEvent
  } = useDev();

  const [activeFilter, setActiveFilter] = useState<TabFilter>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedWishForFulfill, setSelectedWishForFulfill] = useState<WishlistItem | null>(null);
  const [fulfillStory, setFulfillStory] = useState('');
  const [fulfillPhotoUrl, setFulfillPhotoUrl] = useState('');

  // Form State for Quick Add
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newGalleryImages, setNewGalleryImages] = useState<string[]>([]);
  const [newType, setNewType] = useState<WishlistItemType>('fashion');
  const [newStatus, setNewStatus] = useState<WishlistStatus>('dreaming');
  const [newPrice, setNewPrice] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newIsForSelf, setNewIsForSelf] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Smart Autocomplete State
  const [isExtractingLink, setIsExtractingLink] = useState(false);
  const [extractedSource, setExtractedSource] = useState<string | null>(null);

  const handleUrlChange = async (url: string) => {
    setNewUrl(url);
    if (!url || url.trim().length < 5) {
      setExtractedSource(null);
      return;
    }

    const trimmed = url.trim();
    if (
      trimmed.includes('.') &&
      (trimmed.startsWith('http') ||
        trimmed.includes('www.') ||
        trimmed.includes('.com') ||
        trimmed.includes('.es') ||
        trimmed.includes('.org') ||
        trimmed.includes('.co'))
    ) {
      setIsExtractingLink(true);
      try {
        const meta = await extractLinkMetadata(trimmed);
        if (meta) {
          triggerHaptic('selection');
          setExtractedSource(meta.brand || meta.domain || 'tienda');

          // Always autofill exact metadata from link
          if (meta.title) setNewTitle(meta.title);
          if (meta.brand) setNewBrand(meta.brand);
          if (meta.type) setNewType(meta.type);
          if (meta.phoneNumber) setNewPhone(meta.phoneNumber);
          if (meta.estimatedPrice !== undefined && meta.estimatedPrice > 0) {
            setNewPrice(meta.estimatedPrice.toString());
          } else {
            setNewPrice('');
          }
          if (meta.galleryImages && meta.galleryImages.length > 0) {
            setNewGalleryImages(meta.galleryImages);
            setNewImageUrl(meta.galleryImages[0]);
          } else if (meta.imageUrl) {
            setNewGalleryImages([meta.imageUrl]);
            setNewImageUrl(meta.imageUrl);
          } else {
            setNewGalleryImages([]);
            setNewImageUrl('');
          }
          if (meta.description) {
            setNewDescription(meta.description);
          }
        }
      } catch (err) {
        console.warn('Error extracting link meta:', err);
      } finally {
        setIsExtractingLink(false);
      }
    }
  };

  const handleSelectCoverImage = (imgUrl: string) => {
    triggerHaptic('light');
    setNewImageUrl(imgUrl);
  };

  const handleRemoveGalleryImage = (imgUrl: string) => {
    triggerHaptic('light');
    setNewGalleryImages((prev) => {
      const updated = prev.filter((img) => img !== imgUrl);
      if (newImageUrl === imgUrl) {
        setNewImageUrl(updated[0] || '');
      }
      return updated;
    });
  };

  const handleCustomImageAdded = (val: string | null) => {
    if (val) {
      setNewImageUrl(val);
      setNewGalleryImages((prev) => [val, ...prev.filter((img) => img !== val)]);
    } else {
      setNewImageUrl('');
    }
  };

  const resetAddForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewUrl('');
    setNewImageUrl('');
    setNewGalleryImages([]);
    setNewType('fashion');
    setNewStatus('dreaming');
    setNewPrice('');
    setNewBrand('');
    setNewPhone('');
    setNewIsForSelf(false);
    setShowAdvancedFields(false);
    setExtractedSource(null);
    setIsExtractingLink(false);
  };

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

  const handleSaveWish = () => {
    if (!newTitle.trim()) {
      Alert.alert('Falta el título', 'Escribe al menos una idea o nombre para el deseo.');
      return;
    }

    triggerHaptic('heavy');

    addWish({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      sourceUrl: newUrl.trim() || undefined,
      externalImageUrl: newImageUrl.trim() || (newGalleryImages.length > 0 ? newGalleryImages[0] : undefined),
      images: newGalleryImages.length > 0 ? newGalleryImages : (newImageUrl ? [newImageUrl] : undefined),
      type: newType,
      status: newStatus,
      brand: newBrand.trim() || undefined,
      estimatedPrice: newPrice ? parseFloat(newPrice) : undefined,
      isForSelf: newIsForSelf,
      phoneNumber: newPhone.trim() || undefined
    });

    // If it's a restaurant, also optionally create a Place
    if (newType === 'restaurant') {
      addSavedPlace({
        name: newTitle.trim(),
        category: 'restaurant',
        status: 'want_to_go',
        note: newDescription.trim() || undefined,
        coverImageUrl: newImageUrl.trim() || undefined,
        phoneNumber: newPhone.trim() || undefined,
        city: 'Valencia'
      });
    }

    resetAddForm();
    setIsAddModalOpen(false);
    Alert.alert('Deseo Guardado', 'Se ha añadido a vuestro catálogo.');
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
    convertWishToSurprise(wish.id, `Sorpresa preparada por ${currentDevUser.name} para cumplir el deseo.`);
    Alert.alert(
      'Sorpresa en marcha',
      `Se ha programado en secreto en el Calendario sin revelar los detalles a ${partnerDevUser.name}.`
    );
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
          <Text style={styles.headerTitle}>Deseos & Rincones</Text>
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

      {/* RESTAURANTS HIGHLIGHT STRIP (when filtering all or restaurants) */}
      {(activeFilter === 'all' || activeFilter === 'restaurants') && restaurantPlaces.length > 0 && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            title="Nuestra Colección de Restaurantes"
            subtitle="Sitios guardados para próximas citas, aniversarios y celebraciones"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantsScroll}>
            {restaurantPlaces.map((place) => (
              <TiltedCard key={place.id} style={styles.restaurantMiniCard} variant="elevated">
                <Image source={{ uri: place.coverImageUrl }} style={styles.restaurantMiniImg} />
                <View style={styles.restaurantMiniInfo}>
                  <View style={styles.restaurantTopRow}>
                    <Text style={styles.restaurantName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.restaurantPrice}>{'€'.repeat(place.priceLevel || 2)}</Text>
                  </View>
                  <Text style={styles.restaurantMeta} numberOfLines={1}>
                    {place.city} · {place.cuisine?.join(', ')}
                  </Text>
                  {place.note && (
                    <Text style={styles.restaurantNote} numberOfLines={2}>
                      "{place.note}"
                    </Text>
                  )}
                  <View style={styles.restaurantActions}>
                    <TouchableOpacity
                      style={styles.restaurantActionBtn}
                      onPress={() => handleScheduleRestaurantDate(place)}
                    >
                      <Text style={styles.restaurantActionText}>📞 Agendar & Llamar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.restaurantActionBtn, styles.restaurantActionSecret]}
                      onPress={() => {
                        convertPlaceToEvent(place.id, '2026-09-12', '21:30');
                        Alert.alert('Sorpresa Programada', `Cena secreta en ${place.name} agendada.`);
                      }}
                    >
                      <Text style={styles.restaurantActionSecretText}>Sorpresa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TiltedCard>
            ))}
          </ScrollView>
        </View>
      )}

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

      {/* QUICK ADD MODAL (ZERO FRICTION) */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Guardar nuevo deseo</Text>
                <Text style={styles.modalSubtitle}>Cero fricción: escribe solo lo que tengas a mano</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* ── 1. SELECTOR PRINCIPAL DE CATEGORÍA ── */}
              <View style={styles.modalCategorySection}>
                <Text style={styles.inputLabel}>Tipo de deseo o rincón</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryChipsScroll}
                >
                  {[
                    { id: 'restaurant', label: '🍽️ Restaurante' },
                    { id: 'fashion', label: '👗 Moda & Regalo' },
                    { id: 'trip', label: '✈️ Viaje & Cita' },
                    { id: 'home', label: '🏡 Hogar & Deco' },
                    { id: 'beauty', label: '💄 Belleza' },
                    { id: 'experience', label: '🎟️ Experiencia' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.categoryChoiceChip,
                        newType === item.id && styles.categoryChoiceChipActive,
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        setNewType(item.id as WishlistItemType);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryChoiceChipText,
                          newType === item.id && styles.categoryChoiceChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* ── 2. ENLACE O TIENDA AUTOCOMPLETABLE ── */}
              <Text style={styles.inputLabel}>
                {newType === 'restaurant'
                  ? 'Enlace de Google Maps / Apple Maps / Web del restaurante'
                  : newType === 'trip'
                  ? 'Enlace de Booking, Airbnb, vuelo o destino'
                  : newType === 'home'
                  ? 'Enlace de la tienda de decoración (IKEA, Zara Home...)'
                  : newType === 'experience'
                  ? 'Enlace del evento, spa o entradas'
                  : 'Enlace web o tienda (autocompleta los datos)'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  newType === 'restaurant'
                    ? 'Pega enlace de Google Maps, TheFork o web...'
                    : newType === 'trip'
                    ? 'Pega enlace de Booking, Airbnb, vuelo o destino...'
                    : newType === 'home'
                    ? 'Pega enlace de Zara Home, IKEA, Kave Home...'
                    : newType === 'experience'
                    ? 'Pega enlace del plan, entradas o concierto...'
                    : 'Pega un enlace de Sézane, Louis Vuitton, Zara, Nike...'
                }
                placeholderTextColor={Colors.light.textMuted}
                value={newUrl}
                onChangeText={handleUrlChange}
                autoCapitalize="none"
              />

              {isExtractingLink && (
                <View style={styles.extractingRow}>
                  <IconSparkles size={13} color={Colors.light.primary} />
                  <Text style={styles.extractingText}>Extrayendo datos de la prenda o plan...</Text>
                </View>
              )}

              {extractedSource && !isExtractingLink && (
                <View style={styles.autocompleteBadge}>
                  <IconSparkles size={13} color={Colors.light.primary} />
                  <Text style={styles.autocompleteBadgeText}>
                    Sugerencias cargadas desde {extractedSource} · Puedes editarlas libremente
                  </Text>
                </View>
              )}

              {/* ── 3. CAMPOS ADAPTADOS SEGÚN EL TIPO SELECCIONADO ── */}
              <Text style={styles.inputLabel}>
                {newType === 'restaurant'
                  ? 'Nombre del restaurante o local *'
                  : newType === 'trip'
                  ? 'Destino o Escapada *'
                  : newType === 'home'
                  ? 'Mueble o elemento deco *'
                  : newType === 'experience'
                  ? 'Experiencia o Plan *'
                  : 'Prenda, regalo o idea *'}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  newType === 'restaurant'
                    ? 'ej. Don Salvatore / Desde 1911 / Sacha'
                    : newType === 'trip'
                    ? 'ej. Escapada a Menorca / Cabaña en Dolomitas'
                    : newType === 'home'
                    ? 'ej. Lámpara de sobremesa lino'
                    : newType === 'experience'
                    ? 'ej. Concierto a la luz de las velas'
                    : 'ej. Bolso Claude Piel Caramelo'
                }
                placeholderTextColor={Colors.light.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* FILA SECUNDARIA DINÁMICA: RESTAURANTE vs MODA/VIAJE */}
              {newType === 'restaurant' ? (
                <>
                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: Spacing.sm }}>
                      <Text style={styles.inputLabel}>Ubicación o Barrio</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ej. Ruzafa, Valencia"
                        placeholderTextColor={Colors.light.textMuted}
                        value={newBrand}
                        onChangeText={setNewBrand}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Tipo de cocina / Ocasión</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ej. Italiano romántico"
                        placeholderTextColor={Colors.light.textMuted}
                        value={newDescription}
                        onChangeText={setNewDescription}
                      />
                    </View>
                  </View>
                  <View style={{ marginTop: Spacing.xs, marginBottom: Spacing.xs }}>
                    <Text style={styles.inputLabel}>📞 Teléfono del local (para llamar con 1 toque al agendar)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="ej. +34 963 74 82 90"
                      placeholderTextColor={Colors.light.textMuted}
                      value={newPhone}
                      onChangeText={setNewPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              ) : (
                <View style={styles.rowTwoInputs}>
                  <View style={{ flex: 1, marginRight: Spacing.sm }}>
                    <Text style={styles.inputLabel}>
                      {newType === 'trip'
                        ? 'Alojamiento o Transporte'
                        : newType === 'home'
                        ? 'Tienda de deco'
                        : newType === 'experience'
                        ? 'Lugar o Proveedor'
                        : 'Marca o Tienda'}
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={
                        newType === 'trip'
                          ? 'ej. Hotel Boutique / Airbnb'
                          : newType === 'home'
                          ? 'ej. Zara Home, IKEA'
                          : newType === 'experience'
                          ? 'ej. Auditorio / Balneario'
                          : 'ej. Sézane, Massimo Dutti'
                      }
                      placeholderTextColor={Colors.light.textMuted}
                      value={newBrand}
                      onChangeText={setNewBrand}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>
                      {newType === 'trip' ? 'Presupuesto aprox. (€)' : 'Precio aprox. (€)'}
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder={newType === 'trip' ? 'ej. 350' : 'ej. 120'}
                      placeholderTextColor={Colors.light.textMuted}
                      value={newPrice}
                      onChangeText={setNewPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* INTERACTIVE MULTI-IMAGE GALLERY SELECTOR */}
              {newGalleryImages.length > 0 && (
                <View style={styles.gallerySelectorSection}>
                  <View style={styles.gallerySelectorHeader}>
                    <Text style={styles.inputLabel}>
                      Galería autocompletada ({newGalleryImages.length} fotos)
                    </Text>
                    <Text style={styles.galleryHint}>Toca para elegir portada</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.galleryScroll}
                  >
                    {newGalleryImages.map((imgUrl, idx) => {
                      const isCover = newImageUrl === imgUrl;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.galleryThumbCard, isCover && styles.galleryThumbCardActive]}
                          activeOpacity={0.8}
                          onPress={() => handleSelectCoverImage(imgUrl)}
                        >
                          <Image source={{ uri: imgUrl }} style={styles.galleryThumbImg} />
                          {isCover && (
                            <View style={styles.coverBadge}>
                              <Text style={styles.coverBadgeText}>★ Portada</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.removeThumbBtn}
                            onPress={() => handleRemoveGalleryImage(imgUrl)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={styles.removeThumbText}>✕</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <PhotoUploadField
                imageUri={newImageUrl}
                onImageChange={handleCustomImageAdded}
                label={
                  newGalleryImages.length > 0
                    ? '+ Añadir otra foto a la galería'
                    : newType === 'restaurant'
                    ? 'Foto del local, plato o carta'
                    : newType === 'trip'
                    ? 'Foto del destino o alojamiento'
                    : 'Foto del deseo o captura'
                }
                placeholderText="Toca para subir foto desde la cámara o galería"
              />

              {newType !== 'restaurant' && (
                <>
                  <Text style={styles.inputLabel}>Notas o detalles</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder={
                      newType === 'trip'
                        ? 'ej. Para primavera o fin de semana largo'
                        : newType === 'home'
                        ? 'ej. Para el salón junto a la ventana'
                        : 'ej. En color caramelo, para una ocasión especial'
                    }
                    placeholderTextColor={Colors.light.textMuted}
                    value={newDescription}
                    onChangeText={setNewDescription}
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}

              {/* TOGGLE ADVANCED */}
              <TouchableOpacity
                style={styles.toggleAdvancedBtn}
                onPress={() => setShowAdvancedFields(!showAdvancedFields)}
              >
                <Text style={styles.toggleAdvancedText}>
                  {showAdvancedFields ? '▲ Ocultar estado emocional' : '▼ Estado emocional e ilusión'}
                </Text>
              </TouchableOpacity>

              {showAdvancedFields && (
                <View style={styles.advancedSection}>
                  <Text style={styles.inputLabel}>Tipo de deseo</Text>
                  <View style={styles.choiceChipsRow}>
                    {(['fashion', 'restaurant', 'trip', 'home', 'beauty', 'experience'] as WishlistItemType[]).map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.choiceChip, newType === t && styles.choiceChipActive]}
                        onPress={() => setNewType(t)}
                      >
                        <Text style={[styles.choiceChipText, newType === t && styles.choiceChipTextActive]}>
                          {t === 'fashion' ? 'Moda' : t === 'restaurant' ? 'Restaurante' : t === 'trip' ? 'Viaje' : t === 'home' ? 'Hogar' : t === 'beauty' ? 'Belleza' : 'Experiencia'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Estado emocional</Text>
                  <View style={styles.choiceChipsRow}>
                    {(['dreaming', 'considering', 'planned', 'someday'] as WishlistStatus[]).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.choiceChip, newStatus === s && styles.choiceChipActive]}
                        onPress={() => setNewStatus(s)}
                      >
                        <Text style={[styles.choiceChipText, newStatus === s && styles.choiceChipTextActive]}>
                          {s === 'dreaming' ? 'Me hace ilusión' : s === 'considering' ? 'Lo pienso' : s === 'planned' ? 'Ocasión especial' : 'Algún día'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: Spacing.sm }}>
                      <Text style={styles.inputLabel}>Precio aprox. (€)</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ej. 85"
                        placeholderTextColor={Colors.light.textMuted}
                        keyboardType="numeric"
                        value={newPrice}
                        onChangeText={setNewPrice}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Marca / Tienda</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="ej. Sézane"
                        placeholderTextColor={Colors.light.textMuted}
                        value={newBrand}
                        onChangeText={setNewBrand}
                      />
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button variant="ghost" onPress={() => setIsAddModalOpen(false)}>Cancelar</Button>
              <Button variant="primary" onPress={handleSaveWish}>Guardar deseo</Button>
            </View>
          </View>
        </View>
      </Modal>

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
              <Button variant="ghost" onPress={() => setIsFulfillModalOpen(false)}>Cerrar</Button>
              <Button variant="sage" onPress={handleConfirmFulfill}>Guardar como Recuerdo</Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.sm
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
});
