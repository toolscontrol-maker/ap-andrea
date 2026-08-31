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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { ScreenWrapper } from '../../../src/components/ui/ScreenWrapper';
import { Badge } from '../../../src/components/ui/Badge';
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { StaggeredItem } from '../../../src/components/ui/StaggeredList';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { PhotoUploadField } from '../../../src/components/ui/PhotoUploadField';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows } from '../../../src/theme/tokens';
import { WishlistItem, WishlistStatus, Place } from '@andrea/types';
import { triggerHaptic } from '../../../src/utils/haptics';
import { AddWishWizardModal, NewWishData } from '../../../src/components/wishes/AddWishWizardModal';
import { CreateSurpriseFlow } from '../../../src/features/calendar/components/CreateSurpriseFlow';
import { SurpriseCreationPayload } from '../../../src/features/calendar/domain/calendar.types';

type TabView = 'all' | 'partner' | 'mine' | 'fulfilled';
type CategoryFilter = 'all' | 'restaurants' | 'fashion' | 'trips' | 'home';

export default function WishesScreen() {
  const router = useRouter();
  const {
    wishes,
    currentDevUser,
    partnerDevUser,
    addWish,
    updateWishStatus,
    convertWishToMemory,
    addSavedPlace,
    convertPlaceToEvent,
    addCoupleEvent,
    addSurprise,
  } = useDev();

  const [activeTab, setActiveTab] = useState<TabView>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [selectedWishForFulfill, setSelectedWishForFulfill] = useState<WishlistItem | null>(null);
  const [fulfillStory, setFulfillStory] = useState('');
  const [fulfillPhotoUrl, setFulfillPhotoUrl] = useState('');

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

  // ── Match Category Filter ──
  const matchCategory = (type?: string) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'restaurants') return type === 'restaurant' || type === 'cena';
    if (categoryFilter === 'fashion') return type === 'fashion' || type === 'beauty' || type === 'regalo';
    if (categoryFilter === 'trips') return type === 'trip' || type === 'experience' || type === 'escapada' || type === 'travel';
    if (categoryFilter === 'home') return type === 'home' || type === 'other';
    return true;
  };

  // ── Helper: Target Determination ──
  const getWishTarget = (wish: WishlistItem): 'partner' | 'mine' | 'both' => {
    if (wish.type === 'restaurant' || wish.type === 'trip' || wish.type === 'experience') {
      return 'both';
    }
    if (wish.ownerUserId === partnerDevUser.id || (!wish.isForSelf && wish.createdByUserId === currentDevUser.id)) {
      return 'partner';
    }
    return 'mine';
  };

  // ── Filtered Wishes ──
  const activeWishes = useMemo(() => wishes.filter((w) => w.status !== 'fulfilled' && w.status !== 'archived'), [wishes]);
  const fulfilledWishes = useMemo(() => wishes.filter((w) => w.status === 'fulfilled'), [wishes]);

  const displayedWishes = useMemo(() => {
    if (activeTab === 'fulfilled') {
      return fulfilledWishes.filter((w) => matchCategory(w.type));
    }
    if (activeTab === 'partner') {
      return activeWishes.filter((w) => (getWishTarget(w) === 'partner' || getWishTarget(w) === 'both') && matchCategory(w.type));
    }
    if (activeTab === 'mine') {
      return activeWishes.filter((w) => (getWishTarget(w) === 'mine' || getWishTarget(w) === 'both') && matchCategory(w.type));
    }
    return activeWishes.filter((w) => matchCategory(w.type));
  }, [wishes, activeTab, categoryFilter]);

  // Tab Badge Counts
  const totalActiveCount = activeWishes.length;
  const partnerCount = activeWishes.filter((w) => getWishTarget(w) === 'partner' || getWishTarget(w) === 'both').length;
  const mineCount = activeWishes.filter((w) => getWishTarget(w) === 'mine' || getWishTarget(w) === 'both').length;
  const fulfilledCount = fulfilledWishes.length;

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

    updateWishStatus(surpriseWishTarget.id, 'in_progress');

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
        return <Badge variant="primary" size="sm">Ilusión</Badge>;
      case 'considering':
        return <Badge variant="secondary" size="sm">En mente</Badge>;
      case 'planned':
        return <Badge variant="butter" size="sm">Ocasión</Badge>;
      case 'someday':
        return <Badge variant="mistBlue" size="sm">Algún día</Badge>;
      case 'in_progress':
        return <Badge variant="sage" size="sm">En camino 🚚</Badge>;
      case 'fulfilled':
        return <Badge variant="neutral" size="sm">Cumplido ✨</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Deseo</Badge>;
    }
  };

  return (
    <ScreenWrapper>
      {/* ── 1. CLEAN APPLE-GRADE HEADER ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.screenTitle}>Sorpresas y Deseos</Text>
          <Text style={styles.screenSubtitle}>
            Ilusiones, compras y planes de {currentDevUser.name} & {partnerDevUser.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btnAddPill}
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic('selection');
            setIsAddModalOpen(true);
          }}
        >
          <Text style={styles.btnAddPillText}>+ Deseo</Text>
        </TouchableOpacity>
      </View>

      {/* ── 2. SINGLE-TIER APPLE SEGMENTED CONTROL ── */}
      <SegmentedControl<TabView>
        options={[
          { id: 'all', label: 'Todos', badgeCount: totalActiveCount },
          { id: 'partner', label: `De ${partnerDevUser.name}`, badgeCount: partnerCount },
          { id: 'mine', label: `De ${currentDevUser.name}`, badgeCount: mineCount },
          { id: 'fulfilled', label: 'Cumplidos', badgeCount: fulfilledCount },
        ]}
        selected={activeTab}
        onSelect={(val) => {
          triggerHaptic('selection');
          setActiveTab(val);
        }}
        activeColor="#FFFFFF"
        activeTextColor={Colors.light.primaryDark}
        style={{ marginBottom: Spacing.sm }}
      />

      {/* ── 3. MINIMALIST HORIZONTAL CATEGORY CHIPS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        <TouchableOpacity
          style={[styles.categoryChip, categoryFilter === 'all' && styles.categoryChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('all');
          }}
        >
          <Text style={[styles.categoryChipText, categoryFilter === 'all' && styles.categoryChipTextActive]}>
            Todo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryChip, categoryFilter === 'restaurants' && styles.categoryChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('restaurants');
          }}
        >
          <Text style={[styles.categoryChipText, categoryFilter === 'restaurants' && styles.categoryChipTextActive]}>
            🍽️ Restaurantes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryChip, categoryFilter === 'fashion' && styles.categoryChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('fashion');
          }}
        >
          <Text style={[styles.categoryChipText, categoryFilter === 'fashion' && styles.categoryChipTextActive]}>
            🛍️ Moda & Regalos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryChip, categoryFilter === 'trips' && styles.categoryChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('trips');
          }}
        >
          <Text style={[styles.categoryChipText, categoryFilter === 'trips' && styles.categoryChipTextActive]}>
            ✈️ Viajes & Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.categoryChip, categoryFilter === 'home' && styles.categoryChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('home');
          }}
        >
          <Text style={[styles.categoryChipText, categoryFilter === 'home' && styles.categoryChipTextActive]}>
            🏡 Hogar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── 4. CONTENT LIST ── */}
      <View style={styles.listContainer}>
        {displayedWishes.length === 0 ? (
          <EmptyState
            emoji={activeTab === 'fulfilled' ? '✨' : '🎁'}
            title={
              activeTab === 'fulfilled'
                ? 'Sin deseos cumplidos en esta categoría'
                : 'Catálogo de ilusiones listo'
            }
            subtitle={
              activeTab === 'fulfilled'
                ? 'Cuando sorprendas a tu pareja o disfrutéis de un momento juntos, márcalo como hecho realidad para guardarlo en la historia.'
                : 'Guarda una prenda, un restaurante o un viaje que os haga ilusión disfrutar.'
            }
            actionText={activeTab !== 'fulfilled' ? '+ Guardar primer deseo' : undefined}
            onAction={activeTab !== 'fulfilled' ? () => setIsAddModalOpen(true) : undefined}
          />
        ) : (
          <View style={styles.cardsGrid}>
            {displayedWishes.map((wish, index) => {
              const target = getWishTarget(wish);
              const isPartnerWish = target === 'partner';
              const isBothWish = target === 'both';

              return (
                <StaggeredItem key={wish.id} index={index}>
                  <View style={styles.appleCard}>
                    {/* Visual Cover Header */}
                    {wish.images && wish.images.length > 1 ? (
                      <View style={styles.photoWrap}>
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          style={styles.photoScroll}
                        >
                          {wish.images.map((img, i) => (
                            <Image key={i} source={{ uri: img }} style={styles.photoImg} />
                          ))}
                        </ScrollView>
                        <View style={styles.photoCountBadge}>
                          <Text style={styles.photoCountText}>✦ {wish.images.length} fotos</Text>
                        </View>
                      </View>
                    ) : (
                      (wish.externalImageUrl || (wish.images && wish.images[0])) && (
                        <Image
                          source={{ uri: wish.externalImageUrl || (wish.images && wish.images[0]) }}
                          style={styles.photoImg}
                        />
                      )
                    )}

                    <View style={styles.cardInner}>
                      {/* Top Ribbon: Badges + Price */}
                      <View style={styles.cardRibbon}>
                        <View style={styles.badgeCluster}>
                          {getStatusBadge(wish.status)}

                          {/* Persona Tag */}
                          <View
                            style={[
                              styles.targetPill,
                              isPartnerWish
                                ? styles.targetPillPartner
                                : isBothWish
                                ? styles.targetPillBoth
                                : styles.targetPillMine,
                            ]}
                          >
                            <Text
                              style={[
                                styles.targetPillText,
                                isPartnerWish
                                  ? styles.targetPillTextPartner
                                  : isBothWish
                                  ? styles.targetPillTextBoth
                                  : styles.targetPillTextMine,
                              ]}
                            >
                              {isPartnerWish
                                ? `🌸 Para ${partnerDevUser.name}`
                                : isBothWish
                                ? `💫 Para los dos`
                                : `🌿 Para ${currentDevUser.name}`}
                            </Text>
                          </View>
                        </View>

                        {wish.estimatedPrice ? (
                          <Text style={styles.priceText}>{wish.estimatedPrice}€</Text>
                        ) : null}
                      </View>

                      {/* Title & Description */}
                      <Text style={styles.titleText}>{wish.title}</Text>
                      {wish.description ? (
                        <Text style={styles.descText} numberOfLines={2}>
                          {wish.description}
                        </Text>
                      ) : null}

                      {/* Metadata Chips */}
                      {(wish.brand || wish.storeName || wish.occasion || wish.size || wish.color) ? (
                        <View style={styles.metaRow}>
                          {wish.brand || wish.storeName ? (
                            <View style={styles.metaPill}>
                              <Text style={styles.metaPillText}>🏷️ {wish.brand || wish.storeName}</Text>
                            </View>
                          ) : null}
                          {wish.size ? (
                            <View style={styles.metaPill}>
                              <Text style={styles.metaPillText}>Talla {wish.size}</Text>
                            </View>
                          ) : null}
                          {wish.color ? (
                            <View style={styles.metaPill}>
                              <Text style={styles.metaPillText}>{wish.color}</Text>
                            </View>
                          ) : null}
                          {wish.occasion ? (
                            <View style={styles.metaPill}>
                              <Text style={styles.metaPillText}>{wish.occasion}</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}

                      {/* Action Bar */}
                      {wish.status !== 'fulfilled' ? (
                        <View style={styles.actionRow}>
                          {/* Call & Book for restaurants */}
                          {wish.type === 'restaurant' ? (
                            <TouchableOpacity
                              style={styles.btnSecondaryAction}
                              activeOpacity={0.8}
                              onPress={() => handleScheduleRestaurantDate(wish)}
                            >
                              <Text style={styles.btnSecondaryActionText}>📞 Reservar</Text>
                            </TouchableOpacity>
                          ) : null}

                          {/* External Buy Link */}
                          {wish.sourceUrl ? (
                            <TouchableOpacity
                              style={styles.btnSecondaryAction}
                              activeOpacity={0.8}
                              onPress={() => Linking.openURL(wish.sourceUrl!)}
                            >
                              <Text style={styles.btnSecondaryActionText}>Ver tienda ↗</Text>
                            </TouchableOpacity>
                          ) : null}

                          {/* Primary: Make Surprise */}
                          <TouchableOpacity
                            style={styles.btnPrimarySurprise}
                            activeOpacity={0.85}
                            onPress={() => handleMakeSurprise(wish)}
                          >
                            <Text style={styles.btnPrimarySurpriseText}>Hacer sorpresa ✨</Text>
                          </TouchableOpacity>

                          {/* Fulfill Option */}
                          <TouchableOpacity
                            style={styles.btnFulfillCheck}
                            activeOpacity={0.8}
                            onPress={() => handleOpenFulfill(wish)}
                          >
                            <Text style={styles.btnFulfillCheckText}>Hecho realidad</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.fulfilledNoteBox}>
                          <Text style={styles.fulfilledNoteText}>
                            ✨ Guardado en la memoria compartida de la pareja.
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
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
                <Text style={styles.modalTitle}>Se hizo realidad ✨</Text>
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
                photoUrl={fulfillPhotoUrl || null}
                onPhotoUploaded={(url) => setFulfillPhotoUrl(url)}
                onPhotoRemoved={() => setFulfillPhotoUrl('')}
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
                  backgroundColor: Colors.light.primary,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
    paddingRight: 48,
  },
  headerTitleCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  screenTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#2B2129',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#766B72',
    marginTop: 2,
    lineHeight: 16,
  },
  btnAddPill: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: Radii.full,
    ...Shadows.subtle,
  },
  btnAddPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryScroll: {
    paddingVertical: 2,
    paddingBottom: Spacing.md,
    gap: 6,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    backgroundColor: '#FAF5EE',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: '#2B2129',
    borderColor: '#2B2129',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#766B72',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 110,
  },
  cardsGrid: {
    gap: Spacing.lg,
  },
  appleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
  },
  photoWrap: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#F5EFE8',
  },
  photoScroll: {
    width: '100%',
    height: 180,
  },
  photoImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5EFE8',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(43, 33, 41, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cardInner: {
    padding: Spacing.lg,
  },
  cardRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  targetPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  targetPillPartner: {
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.25)',
  },
  targetPillMine: {
    backgroundColor: '#EFF7F2',
    borderWidth: 1,
    borderColor: 'rgba(95, 133, 117, 0.25)',
  },
  targetPillBoth: {
    backgroundColor: '#F4EFFF',
    borderWidth: 1,
    borderColor: 'rgba(155, 93, 229, 0.25)',
  },
  targetPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  targetPillTextPartner: {
    color: '#C93B57',
  },
  targetPillTextMine: {
    color: '#2A7B54',
  },
  targetPillTextBoth: {
    color: '#7B42BC',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8A6812',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2129',
    marginTop: 4,
    lineHeight: 21,
  },
  descText: {
    fontSize: 12.5,
    color: '#766B72',
    marginTop: 3,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.sm,
  },
  metaPill: {
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(43, 33, 41, 0.06)',
  },
  metaPillText: {
    fontSize: 11,
    color: '#766B72',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(43, 33, 41, 0.06)',
  },
  btnPrimarySurprise: {
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: '#FAF0F2',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.3)',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimarySurpriseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D84A65',
  },
  btnSecondaryAction: {
    flexGrow: 1,
    minWidth: 90,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F5EFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryActionText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#3A2F38',
  },
  btnFulfillCheck: {
    flexGrow: 1,
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#EFF7F2',
    borderWidth: 1,
    borderColor: 'rgba(95, 133, 117, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFulfillCheckText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2A7B54',
  },
  fulfilledNoteBox: {
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.2)',
    marginTop: Spacing.sm,
  },
  fulfilledNoteText: {
    fontSize: 12,
    color: '#C93B57',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 41, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2129',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#766B72',
    marginTop: 2,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#766B72',
  },
  modalBody: {
    marginBottom: Spacing.lg,
  },
  fulfillWishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: Spacing.md,
    backgroundColor: '#FAF5EE',
    padding: 10,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2B2129',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2B2129',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
