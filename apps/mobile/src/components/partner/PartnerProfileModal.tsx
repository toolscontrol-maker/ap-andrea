import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { useDev } from '../../context/DevContext';
import { Colors } from '../../theme/colors';
import { Spacing, Radii, Shadows, Typography } from '../../theme/tokens';
import { triggerHaptic } from '../../utils/haptics';
import { PhotoUploadField } from '../ui/PhotoUploadField';
import { Badge } from '../ui/Badge';
import {
  IconHeart,
  IconSparkles,
  IconGift,
  IconCamera,
  IconCheck,
  IconCalendar,
  IconStar
} from '../ui/Icons';
import { pushNotificationService } from '../../services/notifications/PushNotificationService';

interface PartnerProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenSurpriseModal?: (wishId?: string) => void;
}

export function PartnerProfileModal({
  visible,
  onClose,
  onOpenSurpriseModal
}: PartnerProfileModalProps) {
  const {
    currentDevUser,
    partnerDevUser,
    activeRole,
    users,
    wishes,
    addRitualSeed,
    updateUserProfile,
  } = useDev();

  const [suggestedPhoto, setSuggestedPhoto] = useState<string>('');
  const [suggestionNote, setSuggestionNote] = useState<string>('');
  const [isSubmittingPhoto, setIsSubmittingPhoto] = useState<boolean>(false);
  const [isPhotoSentSuccess, setIsPhotoSentSuccess] = useState<boolean>(false);

  // Partner specific data
  const isPartnerAndrea = partnerDevUser.name.toLowerCase().includes('andrea');
  const partnerRoleTitle = isPartnerAndrea ? 'Novia & Amor de mi vida' : 'Novio & Creador';
  const partnerBirthday = isPartnerAndrea ? '1 de Septiembre' : '19 de Octubre';

  // Partner wishes
  const partnerWishes = wishes.filter(
    (w) => w.target === (activeRole === 'user1' ? 'user2' : 'user1') || w.authorId === (activeRole === 'user1' ? users.user2.id : users.user1.id)
  );

  // Anniversary & Milestones
  const ANNIVERSARY_DATE = new Date('2025-02-15');
  const FIRST_MET_DATE = new Date('2024-11-23');
  const FIRST_KISS_DATE = new Date('2024-12-08');
  const now = new Date();
  const daysTogether = Math.max(1, Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceMet = Math.max(1, Math.floor((now.getTime() - FIRST_MET_DATE.getTime()) / (1000 * 60 * 60 * 24)));
  const daysSinceKiss = Math.max(1, Math.floor((now.getTime() - FIRST_KISS_DATE.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSendPhotoSuggestion = async () => {
    if (!suggestedPhoto) {
      Alert.alert('Falta la foto', 'Por favor selecciona o sube una foto bonita para sugerir.');
      return;
    }

    setIsSubmittingPhoto(true);
    triggerHaptic('success');

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await addRitualSeed({
        id: `suggested-photo-${Date.now()}`,
        type: 'daily_reflection',
        title: `📸 Foto sugerida por ${currentDevUser.name}`,
        body: suggestionNote.trim() || `¡Hola amor! Te he sugerido esta foto para tu perfil ❤️`,
        photoUrl: suggestedPhoto,
        mood: 'spark',
        isSharedWithPartner: true,
      });

      pushNotificationService.showLocalNotification({
        title: `📸 ¡Nueva Foto Sugerida!`,
        body: `${currentDevUser.name} te ha sugerido una nueva foto de perfil con mucho amor.`,
        category: 'hearts',
      });

      setIsPhotoSentSuccess(true);
      setTimeout(() => {
        setIsPhotoSentSuccess(false);
        setSuggestedPhoto('');
        setSuggestionNote('');
      }, 2500);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo enviar la sugerencia.');
    } finally {
      setIsSubmittingPhoto(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetCard}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerEyebrow}>PERFIL DE MI PAREJA</Text>
              <Text style={styles.headerTitle}>{partnerDevUser.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Hero Partner Avatar & Portrait */}
            <View style={styles.heroCard}>
              <View style={styles.avatarWrapper}>
                {partnerDevUser.avatarPhoto ? (
                  <Image source={{ uri: partnerDevUser.avatarPhoto }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: isPartnerAndrea ? Colors.light.primary : '#EF826A' }]}>
                    <Text style={styles.avatarFallbackText}>{partnerDevUser.avatar}</Text>
                  </View>
                )}
                <View style={styles.heartBeaconBadge}>
                  <Text style={{ fontSize: 13 }}>💖</Text>
                </View>
              </View>

              <Text style={styles.partnerNameTitle}>{partnerDevUser.name}</Text>
              <Text style={styles.partnerRoleSubtitle}>{partnerRoleTitle}</Text>

              <View style={styles.pillStatsRow}>
                <View style={styles.statPill}>
                  <Text style={styles.statPillEmoji}>⏳</Text>
                  <Text style={styles.statPillText}>{daysTogether} días juntos</Text>
                </View>
                <View style={styles.statPill}>
                  <Text style={styles.statPillEmoji}>🎂</Text>
                  <Text style={styles.statPillText}>{partnerBirthday}</Text>
                </View>
              </View>
            </View>

            {/* 2. SUGERIRLE UNA NUEVA FOTO DE PERFIL */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(239, 130, 106, 0.12)' }]}>
                  <IconCamera size={16} color="#EF826A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Sugerirle una Foto de Perfil</Text>
                  <Text style={styles.sectionSubtitle}>
                    Elige una foto bonita para {partnerDevUser.name} y déjale una nota de amor
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: Spacing.sm }}>
                <PhotoUploadField
                  label="Foto que le sugieres"
                  placeholderText="+ Subir foto para sugerirle"
                  photoUrl={suggestedPhoto || null}
                  imageUri={suggestedPhoto || null}
                  onPhotoUploaded={(url) => setSuggestedPhoto(url || '')}
                  onImageChange={(url) => setSuggestedPhoto(url || '')}
                  onPhotoSelected={(url) => setSuggestedPhoto(url || '')}
                  onPhotoRemoved={() => setSuggestedPhoto('')}
                />

                {Boolean(suggestedPhoto) && (
                  <View style={{ marginTop: Spacing.sm }}>
                    <Text style={styles.inputLabel}>Nota o piropo cariñoso (opcional)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ej. ¡Estás guapísima/o en esta foto! ❤️"
                      placeholderTextColor="#9E8E98"
                      value={suggestionNote}
                      onChangeText={setSuggestionNote}
                    />

                    {isPhotoSentSuccess ? (
                      <View style={styles.successBanner}>
                        <IconCheck size={16} color="#2D8A4E" strokeWidth={2.5} />
                        <Text style={styles.successBannerText}>¡Foto sugerida enviada a {partnerDevUser.name}! ✨</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.sendSuggestBtn}
                        activeOpacity={0.85}
                        onPress={handleSendPhotoSuggestion}
                        disabled={isSubmittingPhoto}
                      >
                        <Text style={styles.sendSuggestBtnText}>
                          {isSubmittingPhoto ? 'Enviando...' : `Sugerir Foto a ${partnerDevUser.name} 💌`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* 3. SUS DESEOS E ILUSIONES */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(224, 86, 102, 0.12)' }]}>
                  <IconGift size={16} color={Colors.light.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Sus Deseos e Ilusiones</Text>
                  <Text style={styles.sectionSubtitle}>
                    {partnerWishes.length > 0
                      ? `${partnerWishes.length} cosas que le hacen ilusión`
                      : 'Aún no ha añadido deseos a su lista'}
                  </Text>
                </View>
              </View>

              {partnerWishes.length > 0 ? (
                <View style={styles.wishesList}>
                  {partnerWishes.map((w) => (
                    <View key={w.id} style={styles.wishRow}>
                      <View style={styles.wishEmojiCircle}>
                        <Text style={{ fontSize: 16 }}>{w.emoji || '🎁'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.wishTitle}>{w.title}</Text>
                        {Boolean(w.notes) && (
                          <Text style={styles.wishNotes} numberOfLines={1}>{w.notes}</Text>
                        )}
                        {Boolean(w.priceEstimate) && (
                          <Text style={styles.wishPrice}>{w.priceEstimate}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.surprisePlanBtn}
                        activeOpacity={0.75}
                        onPress={() => {
                          triggerHaptic('selection');
                          onClose();
                          if (onOpenSurpriseModal) onOpenSurpriseModal(w.id);
                        }}
                      >
                        <Text style={styles.surprisePlanBtnText}>Hacer Sorpresa 🤫</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyWishesBox}>
                  <Text style={styles.emptyWishesText}>
                    Cuando {partnerDevUser.name} guarde ideas de regalos, escapadas o citas, las verás aquí para sorprenderle.
                  </Text>
                </View>
              )}
            </View>

            {/* 4. HITOS Y RECUERDOS JUNTOS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(244, 201, 93, 0.18)' }]}>
                  <IconCalendar size={16} color="#D4A017" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Nuestra Cronología de Amor</Text>
                  <Text style={styles.sectionSubtitle}>Momentos que marcaron el inicio</Text>
                </View>
              </View>

              <View style={styles.milestonesList}>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneBullet}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneTitle}>Nos conocimos</Text>
                    <Text style={styles.milestoneDate}>23 de Noviembre de 2024 ({daysSinceMet} días)</Text>
                  </View>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneBullet}>💋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneTitle}>Primer beso</Text>
                    <Text style={styles.milestoneDate}>8 de Diciembre de 2024 ({daysSinceKiss} días)</Text>
                  </View>
                </View>
                <View style={styles.milestoneItem}>
                  <Text style={styles.milestoneBullet}>❤️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneTitle}>Oficialmente juntos</Text>
                    <Text style={styles.milestoneDate}>15 de Febrero de 2025 ({daysTogether} días)</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 19, 18, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
    ...Shadows.elevated,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.06)',
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF826A',
    letterSpacing: 0.8,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: '#2B2129',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    color: '#2B2129',
    fontWeight: '700',
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heartBeaconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(58, 47, 56, 0.1)',
  },
  partnerNameTitle: {
    ...Typography.h2,
    fontSize: 19,
    color: '#1E252B',
  },
  partnerRoleSubtitle: {
    fontSize: 13,
    color: '#766B72',
    marginTop: 2,
  },
  pillStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    gap: 5,
  },
  statPillEmoji: {
    fontSize: 12,
  },
  statPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E252B',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.08)',
    ...Shadows.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E252B',
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: '#766B72',
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#766B72',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.10)',
    fontSize: 13.5,
    color: '#1E252B',
    marginBottom: Spacing.sm,
  },
  sendSuggestBtn: {
    backgroundColor: '#EF826A',
    borderRadius: Radii.full,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendSuggestBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 138, 78, 0.12)',
    padding: Spacing.sm + 2,
    borderRadius: Radii.lg,
    gap: 6,
  },
  successBannerText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2D8A4E',
  },
  wishesList: {
    gap: 8,
    marginTop: 4,
  },
  wishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(58, 47, 56, 0.06)',
  },
  wishEmojiCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  wishTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E252B',
  },
  wishNotes: {
    fontSize: 11.5,
    color: '#766B72',
    marginTop: 1,
  },
  wishPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF826A',
    marginTop: 1,
  },
  surprisePlanBtn: {
    backgroundColor: 'rgba(224, 86, 102, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginLeft: 8,
  },
  surprisePlanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  emptyWishesBox: {
    padding: Spacing.md,
    backgroundColor: '#FAF7F2',
    borderRadius: Radii.lg,
    alignItems: 'center',
  },
  emptyWishesText: {
    fontSize: 12,
    color: '#766B72',
    textAlign: 'center',
    lineHeight: 16,
  },
  milestonesList: {
    gap: 8,
    marginTop: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 47, 56, 0.05)',
  },
  milestoneBullet: {
    fontSize: 16,
    marginRight: 10,
  },
  milestoneTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E252B',
  },
  milestoneDate: {
    fontSize: 11.5,
    color: '#766B72',
    marginTop: 1,
  },
});
