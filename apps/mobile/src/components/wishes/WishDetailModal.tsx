import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { WishlistItem, WishlistStatus } from '@andrea/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface WishDetailModalProps {
  visible: boolean;
  wish: WishlistItem | null;
  onClose: () => void;
  onDeleteWish?: (wishId: string) => void;
  onMakeSurprise?: (wish: WishlistItem) => void;
  onFulfillWish?: (wish: WishlistItem) => void;
  currentUserId: string;
  currentUserName: string;
  partnerName: string;
}

export function WishDetailModal({
  visible,
  wish,
  onClose,
  onDeleteWish,
  onMakeSurprise,
  onFulfillWish,
  currentUserId,
  currentUserName,
  partnerName,
}: WishDetailModalProps) {
  if (!visible || !wish) return null;

  // Verify ownership: ONLY the user who created the wish can delete it!
  const isOwner =
    wish.createdByUserId === currentUserId ||
    (wish as any).createdById === currentUserId ||
    (wish.isForSelf && (wish.ownerUserId === currentUserId || wish.createdByUserId === currentUserId)) ||
    (currentUserName.toLowerCase().includes('tonet') && ((wish as any).createdById?.toLowerCase().includes('tonet') || wish.createdByUserId === 'user1')) ||
    (currentUserName.toLowerCase().includes('andrea') && ((wish as any).createdById?.toLowerCase().includes('andrea') || wish.createdByUserId === 'user2'));

  const handleDelete = () => {
    if (!isOwner) {
      Alert.alert('Acción no permitida', 'Solo la persona que creó este deseo puede eliminarlo.');
      return;
    }

    triggerHaptic('warning');
    Alert.alert(
      '¿Eliminar este deseo?',
      `¿Estás seguro de que quieres eliminar "${wish.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar 🗑️',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('success');
            if (onDeleteWish) onDeleteWish(wish.id);
            onClose();
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: WishlistStatus) => {
    switch (status) {
      case 'dreaming':
        return <Badge variant="primary" size="md">Ilusión ✨</Badge>;
      case 'considering':
        return <Badge variant="secondary" size="md">En mente 💭</Badge>;
      case 'planned':
        return <Badge variant="butter" size="md">Para ocasión especial 💛</Badge>;
      case 'someday':
        return <Badge variant="mistBlue" size="md">Algún día 🌟</Badge>;
      case 'in_progress':
        return <Badge variant="sage" size="md">En camino 🚚</Badge>;
      case 'fulfilled':
        return <Badge variant="neutral" size="md">Cumplido 🎉</Badge>;
      default:
        return <Badge variant="neutral" size="md">Deseo</Badge>;
    }
  };

  const allPhotos = wish.images && wish.images.length > 0 ? wish.images : (wish.externalImageUrl ? [wish.externalImageUrl] : []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              {getStatusBadge(wish.status)}
              <View style={[styles.ownerTag, isOwner ? styles.ownerTagMine : styles.ownerTagPartner]}>
                <Text style={[styles.ownerTagText, isOwner ? styles.ownerTagTextMine : styles.ownerTagTextPartner]}>
                  {isOwner ? `Creado por ti (${currentUserName})` : `Creado por ${partnerName}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Photos */}
            {allPhotos.length > 0 && (
              <View style={styles.photoContainer}>
                {allPhotos.length > 1 ? (
                  <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                    {allPhotos.map((img, i) => (
                      <Image key={i} source={{ uri: img }} style={styles.detailPhoto} resizeMode="cover" />
                    ))}
                  </ScrollView>
                ) : (
                  <Image source={{ uri: allPhotos[0] }} style={styles.detailPhoto} resizeMode="cover" />
                )}
              </View>
            )}

            {/* Title & Brand */}
            <Text style={styles.titleText}>{wish.title}</Text>
            {wish.brand || wish.storeName ? (
              <Text style={styles.brandText}>{wish.brand || wish.storeName}</Text>
            ) : null}

            {/* Price Card */}
            {wish.estimatedPrice ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>PRECIO ESTIMADO</Text>
                <Text style={styles.priceValue}>{wish.estimatedPrice}€</Text>
              </View>
            ) : null}

            {/* Notes / Story */}
            {wish.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>NOTAS & DETALLES</Text>
                <Text style={styles.notesContent}>{wish.notes}</Text>
              </View>
            ) : null}

            {/* Store Link */}
            {wish.sourceUrl ? (
              <TouchableOpacity
                style={styles.storeLinkCard}
                activeOpacity={0.8}
                onPress={() => Linking.openURL(wish.sourceUrl!)}
              >
                <Text style={{ fontSize: 16 }}>🛍️</Text>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.storeLinkTitle}>Ver en tienda oficial</Text>
                  <Text style={styles.storeLinkUrl} numberOfLines={1}>{wish.sourceUrl}</Text>
                </View>
                <Text style={styles.storeLinkChevron}>↗</Text>
              </TouchableOpacity>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actionsColumn}>
              {/* Partner action: Make surprise */}
              {!isOwner && onMakeSurprise && (
                <TouchableOpacity
                  style={styles.btnSurprise}
                  activeOpacity={0.85}
                  onPress={() => {
                    onClose();
                    onMakeSurprise(wish);
                  }}
                >
                  <Text style={styles.btnSurpriseText}>Preparar sorpresa para {partnerName} ✨</Text>
                </TouchableOpacity>
              )}

              {/* Fulfill Action */}
              {onFulfillWish && (
                <TouchableOpacity
                  style={styles.btnFulfill}
                  activeOpacity={0.8}
                  onPress={() => {
                    onClose();
                    onFulfillWish(wish);
                  }}
                >
                  <Text style={styles.btnFulfillText}>✓ Marcar como hecho realidad</Text>
                </TouchableOpacity>
              )}

              {/* Delete Button (ONLY FOR CREATOR/OWNER) */}
              {isOwner ? (
                <TouchableOpacity
                  style={styles.btnDelete}
                  activeOpacity={0.8}
                  onPress={handleDelete}
                >
                  <Text style={styles.btnDeleteText}>🗑️ Eliminar este deseo</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.protectedNoticeBox}>
                  <Text style={styles.protectedNoticeText}>
                    🔒 Este deseo pertenece a {partnerName}. Solo ella/él puede eliminarlo.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '92%',
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
    ...Shadows.elevated,
    zIndex: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(58, 47, 56, 0.2)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.06)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ownerTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  ownerTagMine: {
    backgroundColor: 'rgba(224, 86, 102, 0.10)',
  },
  ownerTagPartner: {
    backgroundColor: 'rgba(239, 130, 106, 0.10)',
  },
  ownerTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ownerTagTextMine: {
    color: Colors.light.primary,
  },
  ownerTagTextPartner: {
    color: '#EF826A',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(58, 47, 56, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#66737C',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  photoContainer: {
    width: '100%',
    height: 240,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: '#FAF7F2',
  },
  detailPhoto: {
    width: 340,
    height: 240,
    borderRadius: Radii.xl,
  },
  titleText: {
    ...Typography.h2,
    fontSize: 20,
    color: '#1E252B',
    marginBottom: 4,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#766B72',
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#766B72',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  notesBox: {
    backgroundColor: '#FAF7F2',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
  },
  notesLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#766B72',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  notesContent: {
    fontSize: 13.5,
    color: '#1E252B',
    lineHeight: 19,
  },
  storeLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.12)',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    marginBottom: Spacing.lg,
  },
  storeLinkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E252B',
  },
  storeLinkUrl: {
    fontSize: 11.5,
    color: Colors.light.primary,
    marginTop: 1,
  },
  storeLinkChevron: {
    fontSize: 18,
    color: '#A79EA4',
    fontWeight: '700',
  },
  actionsColumn: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  btnSurprise: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 13,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.subtle,
  },
  btnSurpriseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnFulfill: {
    backgroundColor: 'rgba(58, 47, 56, 0.06)',
    paddingVertical: 12,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFulfillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#2B2129',
  },
  btnDelete: {
    backgroundColor: 'rgba(217, 93, 93, 0.10)',
    paddingVertical: 12,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(217, 93, 93, 0.20)',
    marginTop: 4,
  },
  btnDeleteText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D95D5D',
  },
  protectedNoticeBox: {
    padding: Spacing.md,
    backgroundColor: 'rgba(58, 47, 56, 0.04)',
    borderRadius: Radii.lg,
    alignItems: 'center',
    marginTop: 4,
  },
  protectedNoticeText: {
    fontSize: 12,
    color: '#766B72',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
