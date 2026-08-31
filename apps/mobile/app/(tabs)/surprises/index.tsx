import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDev } from '../../../src/context/DevContext';
import { Colors } from '../../../src/theme/colors';
import { Radii, Shadows, Spacing, Typography } from '../../../src/theme/tokens';
import { ScreenWrapper, SectionHeader, SegmentedControl, Card, Badge, Button, EmptyState } from '../../../src/components/ui';
import { DiaryEntryUI, DecryptedSurpriseContent, WishlistItem } from '@andrea/types';
import { FulfillSurpriseWizardModal } from '../../../src/components/surprises/FulfillSurpriseWizardModal';
import { triggerHaptic } from '../../../src/utils/haptics';

type KanbanStatus = 'idea' | 'comprando' | 'listo' | 'entregado';

export default function SurprisesScreen() {
  const [activeKanban, setActiveKanban] = useState<KanbanStatus>('idea');
  const {
    surprises,
    wishes,
    currentDevUser,
    partnerDevUser,
    updateSurpriseStatus,
    recordSurprisePurchase,
    recordSurpriseDelivery,
    deleteSurprise,
  } = useDev();
  const router = useRouter();

  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'purchase' | 'delivery'>('purchase');
  const [selectedSurprise, setSelectedSurprise] = useState<DiaryEntryUI | null>(null);

  const mySurprises = surprises.filter((e) => {
    const c = e.content as DecryptedSurpriseContent;
    const matchesStatus = (c.status || 'idea') === activeKanban;
    if (activeKanban === 'entregado') return matchesStatus;
    // For non-delivered surprises, author sees all; partner sees if in progress/ready
    if (e.authorId === currentDevUser.id) return matchesStatus;
    return matchesStatus && (activeKanban === 'comprando' || activeKanban === 'listo');
  });

  const getStatusCount = (status: KanbanStatus) => {
    return surprises.filter((e) => {
      const c = e.content as DecryptedSurpriseContent;
      if (status === 'entregado') return (c.status || 'idea') === status;
      if (e.authorId === currentDevUser.id) return (c.status || 'idea') === status;
      return (c.status || 'idea') === status && (status === 'comprando' || status === 'listo');
    }).length;
  };

  const findLinkedWish = (item: DiaryEntryUI): WishlistItem | undefined => {
    const title = (item.content as any)?.title || '';
    return wishes.find((w) => title.toLowerCase().includes(w.title.toLowerCase()));
  };

  const handleOpenPurchaseModal = (item: DiaryEntryUI) => {
    setSelectedSurprise(item);
    setModalMode('purchase');
    setIsFulfillModalOpen(true);
  };

  const handleOpenDeliveryModal = (item: DiaryEntryUI) => {
    setSelectedSurprise(item);
    setModalMode('delivery');
    setIsFulfillModalOpen(true);
  };

  const getOccasionBadgeVariant = (occasion?: string): 'primary' | 'secondary' | 'sage' | 'butter' | 'mistBlue' => {
    switch (occasion) {
      case 'aniversario': return 'primary';
      case 'cumpleaños': return 'butter';
      case 'reconciliación': return 'sage';
      default: return 'secondary';
    }
  };

  return (
    <ScreenWrapper>
      {/* Section Header */}
      <SectionHeader
        title="Caja de Sorpresas"
        subtitle={`Prepara gestos y detalles con ilusión para ${partnerDevUser.name}`}
        action={
          <Button
            variant="primary"
            size="sm"
            onPress={() => router.push('/(tabs)/surprises/new')}
          >
            + Preparar
          </Button>
        }
      />

      {/* Secret Vault Banner */}
      <View style={styles.vaultCard}>
        <View style={styles.vaultIconCircle}>
          <Text style={styles.vaultEmoji}>🎁</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vaultTitle}>VAULT SECRETO DE PAREJA</Text>
          <Text style={styles.vaultSub}>
            Tus planes están guardados con ilusión. Podrás registrar la compra y tu pareja marcará su llegada con una foto para la historia.
          </Text>
        </View>
      </View>

      {/* Kanban Column Selector */}
      <SegmentedControl<KanbanStatus>
        options={[
          { id: 'idea', label: '💡 Ideas', badgeCount: getStatusCount('idea') },
          { id: 'comprando', label: '✨ En marcha', badgeCount: getStatusCount('comprando') },
          { id: 'listo', label: '🎁 Listos', badgeCount: getStatusCount('listo') },
          { id: 'entregado', label: '💌 Entregados', badgeCount: getStatusCount('entregado') },
        ]}
        selected={activeKanban}
        onSelect={setActiveKanban}
        activeColor={Colors.light.surfaceElevated}
        activeTextColor={Colors.light.primaryDark}
      />

      {/* Content List */}
      {mySurprises.length === 0 ? (
        <EmptyState
          emoji={activeKanban === 'idea' ? '🎁' : activeKanban === 'comprando' ? '✨' : activeKanban === 'listo' ? '🎉' : '💌'}
          title={activeKanban === 'idea' ? `Guarda una idea secreta para ${partnerDevUser.name}` : 'Sin detalles en esta fase'}
          subtitle={
            activeKanban === 'idea'
              ? 'Una escapada sorpresa, un libro que mencionó de pasada o una prenda de Sézane. El valor está en el cariño y la ilusión.'
              : 'Mueve tus ideas a esta fase a medida que vayas preparando el detalle.'
          }
          actionText="+ Anotar idea secreta"
          onAction={() => router.push('/(tabs)/surprises/new')}
          actionVariant="primary"
          iconBgColor={Colors.light.primaryLight}
        />
      ) : (
        mySurprises.map((item) => {
          const c = item.content as any;
          const isMine = item.authorId === currentDevUser.id;
          const linkedWish = findLinkedWish(item);
          const purchaseDetails = c?.purchaseDetails;
          const deliveryDetails = c?.deliveryDetails;

          return (
            <View key={item.id} style={styles.surpriseCard}>
              {/* Card Top Ribbon */}
              <View style={styles.cardHeader}>
                <Badge variant={getOccasionBadgeVariant(c.occasion)} size="sm">
                  {c.occasion || (linkedWish ? 'Deseo cumplido' : 'Sin ocasión')}
                </Badge>
                <Text style={styles.cardDate}>
                  📅 {deliveryDetails?.deliveredAt || purchaseDetails?.purchasedAt || item.date}
                </Text>
              </View>

              {/* Title & Description */}
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.description}</Text>

              {/* Purchase Details Box if present */}
              {purchaseDetails && (
                <View style={styles.infoBadgeBox}>
                  <Text style={styles.infoBadgeHeading}>
                    📦 Comprado el {purchaseDetails.purchasedAt}
                  </Text>
                  {purchaseDetails.purchaseNotes && (
                    <Text style={styles.infoBadgeText}>
                      💬 "{purchaseDetails.purchaseNotes}"
                    </Text>
                  )}
                  {purchaseDetails.purchasePhotoUrl && (
                    <Image
                      source={{ uri: purchaseDetails.purchasePhotoUrl }}
                      style={styles.infoThumbnail}
                    />
                  )}
                </View>
              )}

              {/* Delivery Details Box if delivered */}
              {deliveryDetails && (
                <View style={[styles.infoBadgeBox, { backgroundColor: '#FFF5F1', borderColor: 'rgba(224, 86, 102, 0.2)' }]}>
                  <Text style={[styles.infoBadgeHeading, { color: Colors.light.primary }]}>
                    ✨ Entregado y Recibido el {deliveryDetails.deliveredAt}
                  </Text>
                  {deliveryDetails.partnerReaction && (
                    <Text style={styles.infoBadgeText}>
                      💖 Reacción: "{deliveryDetails.partnerReaction}"
                    </Text>
                  )}
                  {deliveryDetails.deliveredPhotoUrl && (
                    <Image
                      source={{ uri: deliveryDetails.deliveredPhotoUrl }}
                      style={styles.deliveryPhotoBig}
                    />
                  )}
                </View>
              )}

              {/* Budget Badge */}
              {c.budgetRange && !purchaseDetails ? (
                <View style={styles.budgetBox}>
                  <Text style={styles.budgetLabel}>Presupuesto estimado:</Text>
                  <Text style={styles.budgetValue}>€{c.budgetRange[0]} – €{c.budgetRange[1]}</Text>
                </View>
              ) : null}

              {/* Footer with Action Buttons */}
              <View style={styles.cardFooter}>
                <Text style={styles.authorBadge}>
                  {isMine ? `Preparado por ti para ${partnerDevUser.name}` : `Preparado por ${partnerDevUser.name}`}
                </Text>

                {/* Author Purchase / Manage Action */}
                {isMine && c.status !== 'entregado' && (
                  <TouchableOpacity
                    style={styles.advanceBtn}
                    onPress={() => handleOpenPurchaseModal(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.advanceBtnText}>
                      {c.status === 'idea' ? 'Comprar / Gestionar 🛒' : 'Actualizar Pedido 📦'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Recipient Fulfill / Deliver Action */}
                {!isMine && c.status !== 'entregado' && (
                  <TouchableOpacity
                    style={[styles.advanceBtn, { backgroundColor: Colors.light.primary }]}
                    onPress={() => handleOpenDeliveryModal(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.advanceBtnText}>
                      ✨ ¡Me ha llegado!
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Creator Delete Button */}
                {isMine && (
                  <TouchableOpacity
                    style={styles.deleteSurpriseBtn}
                    onPress={() => {
                      triggerHaptic('warning');
                      Alert.alert(
                        '¿Eliminar sorpresa?',
                        `¿Estás seguro de que deseas eliminar "${c.title}"?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Eliminar 🗑️',
                            style: 'destructive',
                            onPress: () => {
                              triggerHaptic('success');
                              deleteSurprise(item.id);
                            },
                          },
                        ]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteSurpriseBtnText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      {/* Fulfill Wizard Modal */}
      <FulfillSurpriseWizardModal
        visible={isFulfillModalOpen}
        onClose={() => {
          setIsFulfillModalOpen(false);
          setSelectedSurprise(null);
        }}
        surpriseItem={selectedSurprise}
        linkedWish={selectedSurprise ? findLinkedWish(selectedSurprise) : null}
        mode={modalMode}
        currentUserName={currentDevUser.name}
        partnerUserName={partnerDevUser.name}
        onConfirmPurchase={(data) => {
          if (selectedSurprise) {
            recordSurprisePurchase(selectedSurprise.id, data);
          }
        }}
        onConfirmDelivery={(data) => {
          if (selectedSurprise) {
            recordSurpriseDelivery(selectedSurprise.id, data);
          }
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EA',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.4)',
    borderRadius: Radii['2xl'],
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  vaultIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.butter,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.butter,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
  vaultEmoji: {
    fontSize: 20,
  },
  vaultTitle: {
    ...Typography.overline,
    color: '#8A6812',
    letterSpacing: 1.1,
    fontSize: 10,
  },
  vaultSub: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  surpriseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.08)',
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.light.textMuted,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 21,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.light.sageLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  budgetLabel: {
    ...Typography.caption,
    color: Colors.light.sageDark,
  },
  budgetValue: {
    ...Typography.captionBold,
    color: Colors.light.sageDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: Spacing.md,
  },
  authorBadge: {
    ...Typography.caption,
    color: Colors.light.textMuted,
  },
  advanceBtn: {
    backgroundColor: Colors.light.butterDark,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Radii.lg,
    ...Shadows.subtle,
  },
  advanceBtnText: {
    ...Typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
  deleteSurpriseBtn: {
    backgroundColor: 'rgba(217, 93, 93, 0.10)',
    paddingHorizontal: 10,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(217, 93, 93, 0.25)',
    marginLeft: 8,
  },
  deleteSurpriseBtnText: {
    fontSize: 13,
  },
  infoBadgeBox: {
    backgroundColor: '#FAF5EA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    marginBottom: Spacing.md,
  },
  infoBadgeHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6812',
    marginBottom: 4,
  },
  infoBadgeText: {
    fontSize: 12,
    color: '#766B72',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  infoThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#EFEBE6',
  },
  deliveryPhotoBig: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#EFEBE6',
  },
});
