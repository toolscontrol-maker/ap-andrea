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
import { SegmentedControl } from '../../../src/components/ui/SegmentedControl';
import { TiltedCard } from '../../../src/components/ui/TiltedCard';
import { StaggeredItem } from '../../../src/components/ui/StaggeredList';
import { SectionHeader } from '../../../src/components/ui/SectionHeader';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { PhotoUploadField } from '../../../src/components/ui/PhotoUploadField';
import { Colors } from '../../../src/theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../../src/theme/tokens';
import { WishlistItem, WishlistStatus, WishlistItemType, Place, DiaryEntryUI } from '@andrea/types';
import { triggerHaptic } from '../../../src/utils/haptics';
import { AddWishWizardModal, NewWishData } from '../../../src/components/wishes/AddWishWizardModal';
import { CreateSurpriseFlow } from '../../../src/features/calendar/components/CreateSurpriseFlow';
import { SurpriseCreationPayload } from '../../../src/features/calendar/domain/calendar.types';

type OwnerFilter = 'all' | 'partner' | 'mine';
type LifecycleFilter = 'active' | 'fulfilled';
type CategoryFilter = 'all' | 'restaurants' | 'fashion' | 'trips' | 'home';

export default function WishesScreen() {
  const router = useRouter();
  const {
    wishes,
    surprises,
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

  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<LifecycleFilter>('active');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

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

  // ── Helper: Wish Ownership ──
  const isWishForPartner = (wish: WishlistItem) => {
    return wish.ownerUserId === partnerDevUser.id || wish.createdByUserId === partnerDevUser.id;
  };

  const isWishForMine = (wish: WishlistItem) => {
    return wish.ownerUserId === currentDevUser.id || wish.createdByUserId === currentDevUser.id;
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

  // ── Compute Counts ──
  const activeWishes = useMemo(() => wishes.filter((w) => w.status !== 'fulfilled' && w.status !== 'archived'), [wishes]);
  const fulfilledWishes = useMemo(() => wishes.filter((w) => w.status === 'fulfilled'), [wishes]);

  const activePartnerWishes = useMemo(() => activeWishes.filter((w) => isWishForPartner(w) && matchCategory(w.type)), [activeWishes, categoryFilter]);
  const activeMineWishes = useMemo(() => activeWishes.filter((w) => isWishForMine(w) && matchCategory(w.type)), [activeWishes, categoryFilter]);

  const fulfilledAllWishes = useMemo(() => fulfilledWishes.filter((w) => matchCategory(w.type)), [fulfilledWishes, categoryFilter]);
  const fulfilledPartnerWishes = useMemo(() => fulfilledWishes.filter((w) => isWishForPartner(w) && matchCategory(w.type)), [fulfilledWishes, categoryFilter]);
  const fulfilledMineWishes = useMemo(() => fulfilledWishes.filter((w) => isWishForMine(w) && matchCategory(w.type)), [fulfilledWishes, categoryFilter]);

  // Counts for Badges
  const totalActive = activeWishes.length;
  const totalFulfilled = fulfilledWishes.length;
  const partnerActiveCount = activeWishes.filter((w) => isWishForPartner(w)).length;
  const mineActiveCount = activeWishes.filter((w) => isWishForMine(w)).length;

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
        return <Badge variant="primary">Me hace ilusión</Badge>;
      case 'considering':
        return <Badge variant="secondary">En consideración</Badge>;
      case 'planned':
        return <Badge variant="butter">Ocasión especial</Badge>;
      case 'someday':
        return <Badge variant="mistBlue">Algún día</Badge>;
      case 'in_progress':
        return <Badge variant="sage">En camino 🚚</Badge>;
      case 'fulfilled':
        return <Badge variant="neutral">✨ Hecho realidad</Badge>;
      default:
        return <Badge variant="neutral">Deseo</Badge>;
    }
  };

  // ── Render Wish Card Helper ──
  const renderWishCard = (wish: WishlistItem, index: number) => {
    const isMine = wish.ownerUserId === currentDevUser.id || wish.createdByUserId === currentDevUser.id;
    const isPartner = !isMine;

    return (
      <StaggeredItem key={wish.id} index={index}>
        <TiltedCard style={styles.wishCard} variant="elevated">
          {/* Cover Photo or Multi-Photo Gallery */}
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
            {/* Top Row: Status + Author Pill + Price */}
            <View style={styles.wishTopRow}>
              <View style={styles.wishBadgeRow}>
                {getStatusBadge(wish.status)}
                <View
                  style={[
                    styles.authorPill,
                    isPartner ? styles.authorPillPartner : styles.authorPillMine,
                  ]}
                >
                  <Text
                    style={[
                      styles.authorPillText,
                      isPartner ? styles.authorPillTextPartner : styles.authorPillTextMine,
                    ]}
                  >
                    {isPartner ? `🌸 Ilusión de ${partnerDevUser.name}` : `🌿 De ${currentDevUser.name}`}
                  </Text>
                </View>
              </View>
              {wish.estimatedPrice && (
                <Text style={styles.wishPriceTag}>{wish.estimatedPrice}€</Text>
              )}
            </View>

            {/* Title & Description */}
            <Text style={styles.wishTitle}>{wish.title}</Text>
            {wish.description && (
              <Text style={styles.wishDescription}>{wish.description}</Text>
            )}

            {/* Metadata Tags */}
            <View style={styles.wishMetaRow}>
              {wish.brand && <Text style={styles.wishBrandTag}>🏷️ {wish.brand}</Text>}
              {wish.sourceDomain && (
                <Text style={styles.wishDomainTag}>🔗 {wish.sourceDomain}</Text>
              )}
              {wish.occasion && (
                <Text style={styles.wishOccasionTag}>🎉 {wish.occasion}</Text>
              )}
            </View>

            {/* Actions Footer */}
            <View style={styles.wishActionFooter}>
              {wish.status !== 'fulfilled' && (
                <>
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

                  {/* Prepare Surprise Action */}
                  <TouchableOpacity
                    style={styles.btnSurpriseTrigger}
                    activeOpacity={0.8}
                    onPress={() => handleMakeSurprise(wish)}
                  >
                    <Text style={styles.btnSurpriseTriggerText}>
                      Hacerle la sorpresa ✨
                    </Text>
                  </TouchableOpacity>

                  {/* Mark as Fulfilled Action */}
                  <TouchableOpacity
                    style={styles.btnFulfillTrigger}
                    activeOpacity={0.8}
                    onPress={() => handleOpenFulfill(wish)}
                  >
                    <Text style={styles.btnFulfillTriggerText}>Se hizo realidad 🎉</Text>
                  </TouchableOpacity>
                </>
              )}

              {wish.status === 'fulfilled' && (
                <View style={styles.fulfilledRecordBox}>
                  <Text style={styles.fulfilledRecordText}>
                    ✨ Este deseo se hizo realidad y está guardado en vuestra historia.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TiltedCard>
      </StaggeredItem>
    );
  };

  return (
    <ScreenWrapper>
      {/* HEADER EDITORIAL */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.headerTitle}>Sorpresas y Deseos</Text>
          <Text style={styles.headerSubtitle}>
            Ilusiones, compras y secretos compartidos entre {currentDevUser.name} & {partnerDevUser.name}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.btnQuickAdd}
          activeOpacity={0.85}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Text style={styles.btnQuickAddText}>+ Guardar deseo</Text>
        </TouchableOpacity>
      </View>

      {/* ── 1. PERSONA SELECTOR (TÚ Y ELLA) ── */}
      <SegmentedControl<OwnerFilter>
        options={[
          { id: 'all', label: '💫 Todos', badgeCount: lifecycleFilter === 'active' ? totalActive : totalFulfilled },
          { id: 'partner', label: `🌸 De ${partnerDevUser.name}`, badgeCount: partnerActiveCount },
          { id: 'mine', label: `🌿 De ${currentDevUser.name}`, badgeCount: mineActiveCount },
        ]}
        selected={ownerFilter}
        onSelect={(val) => {
          triggerHaptic('selection');
          setOwnerFilter(val);
        }}
        activeColor="#FFFFFF"
        activeTextColor={Colors.light.primaryDark}
        style={{ marginBottom: Spacing.sm }}
      />

      {/* ── 2. LIFECYCLE SELECTOR (ACTIVOS VS CUMPLIDOS) ── */}
      <SegmentedControl<LifecycleFilter>
        options={[
          { id: 'active', label: '✨ Activos & En marcha', badgeCount: totalActive },
          { id: 'fulfilled', label: '🎉 Hechos Realidad', badgeCount: totalFulfilled },
        ]}
        selected={lifecycleFilter}
        onSelect={(val) => {
          triggerHaptic('selection');
          setLifecycleFilter(val);
        }}
        activeColor={Colors.light.surfaceElevated}
        activeTextColor={Colors.light.primaryDark}
        style={{ marginBottom: Spacing.md }}
      />

      {/* ── 3. CATEGORY PILLS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('all');
          }}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'all' && styles.filterChipTextActive]}>
            ✦ Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'restaurants' && styles.filterChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('restaurants');
          }}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'restaurants' && styles.filterChipTextActive]}>
            🍽️ Restaurantes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'fashion' && styles.filterChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('fashion');
          }}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'fashion' && styles.filterChipTextActive]}>
            🛍️ Moda & Regalos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'trips' && styles.filterChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('trips');
          }}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'trips' && styles.filterChipTextActive]}>
            ✈️ Viajes & Citas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'home' && styles.filterChipActive]}
          onPress={() => {
            triggerHaptic('light');
            setCategoryFilter('home');
          }}
        >
          <Text style={[styles.filterChipText, categoryFilter === 'home' && styles.filterChipTextActive]}>
            🏡 Hogar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── 4. CONTENT SECTIONS ── */}

      {/* CASE A: ACTIVE WISHES */}
      {lifecycleFilter === 'active' && (
        <View style={styles.sectionBlock}>
          {/* SECTION A1: ANDREA'S ACTIVE WISHES */}
          {(ownerFilter === 'all' || ownerFilter === 'partner') && (
            <View style={{ marginBottom: Spacing.xl }}>
              <SectionHeader
                title={`🌸 Ilusiones de ${partnerDevUser.name} (${activePartnerWishes.length})`}
                subtitle={`Caprichos, detalles y planes que le hacen ilusión a ${partnerDevUser.name}`}
              />
              {activePartnerWishes.length === 0 ? (
                <EmptyState
                  emoji="🌸"
                  title={`Sin ilusiones de ${partnerDevUser.name} en esta categoría`}
                  subtitle={`Añade un detalle o regalo que le gustaría tener a ${partnerDevUser.name}.`}
                  actionText="+ Guardar ilusión"
                  onAction={() => setIsAddModalOpen(true)}
                />
              ) : (
                <View style={styles.wishesGrid}>
                  {activePartnerWishes.map((w, idx) => renderWishCard(w, idx))}
                </View>
              )}
            </View>
          )}

          {/* SECTION A2: MY ACTIVE WISHES */}
          {(ownerFilter === 'all' || ownerFilter === 'mine') && (
            <View style={{ marginBottom: Spacing.xl }}>
              <SectionHeader
                title={`🌿 Mis Deseos & Planes (${activeMineWishes.length})`}
                subtitle={`Ideas, compras y rincones guardados por ${currentDevUser.name}`}
              />
              {activeMineWishes.length === 0 ? (
                <EmptyState
                  emoji="🌿"
                  title="Sin deseos propios en esta categoría"
                  subtitle="Anota una prenda, un restaurante o un plan que te haga ilusión."
                  actionText="+ Guardar deseo"
                  onAction={() => setIsAddModalOpen(true)}
                />
              ) : (
                <View style={styles.wishesGrid}>
                  {activeMineWishes.map((w, idx) => renderWishCard(w, idx))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* CASE B: FULFILLED WISHES */}
      {lifecycleFilter === 'fulfilled' && (
        <View style={styles.sectionBlock}>
          <SectionHeader
            title={`🎉 Deseos Hechos Realidad (${fulfilledAllWishes.length})`}
            subtitle="Regalos, compras y momentos cumplidos para la eternidad"
          />
          {fulfilledAllWishes.length === 0 ? (
            <EmptyState
              emoji="✨"
              title="Aún no hay deseos marcados como cumplidos"
              subtitle="Cuando sorprendas a tu pareja o disfrutéis de un deseo juntos, márcalo como hecho realidad para guardarlo aquí."
            />
          ) : (
            <View style={styles.wishesGrid}>
              {(ownerFilter === 'all'
                ? fulfilledAllWishes
                : ownerFilter === 'partner'
                ? fulfilledPartnerWishes
                : fulfilledMineWishes
              ).map((w, idx) => renderWishCard(w, idx))}
            </View>
          )}
        </View>
      )}

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
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  authorPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  authorPillPartner: {
    backgroundColor: '#FAF0F2',
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.25)',
  },
  authorPillMine: {
    backgroundColor: '#F0F6F2',
    borderWidth: 1,
    borderColor: 'rgba(95, 133, 117, 0.25)',
  },
  authorPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  authorPillTextPartner: {
    color: '#D84A65',
  },
  authorPillTextMine: {
    color: '#2D6A4F',
  },
  fulfilledRecordBox: {
    backgroundColor: '#FFF8F6',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 86, 102, 0.2)',
    width: '100%',
  },
  fulfilledRecordText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontStyle: 'italic',
    textAlign: 'center',
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
