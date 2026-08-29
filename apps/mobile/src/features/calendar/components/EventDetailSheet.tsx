import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert, Platform } from 'react-native';
import { SanitizedEventItem } from '../domain/calendar.types';
import { formatDateNice, getDaysUntil } from '../utils/calendarDateUtils';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Badge, Button } from '../../../components/ui';

interface EventDetailSheetProps {
  visible: boolean;
  event: SanitizedEventItem | null;
  onClose: () => void;
  onRevealNow: (eventId: string) => void;
  onCompletePlan: (event: SanitizedEventItem) => void;
  partnerName: string;
}

export function EventDetailSheet({
  visible,
  event,
  onClose,
  onRevealNow,
  onCompletePlan,
  partnerName,
}: EventDetailSheetProps) {
  if (!visible || !event) return null;

  const daysUntil = getDaysUntil(event.date);

  const handleReveal = () => {
    triggerHaptic('medium');
    Alert.alert(
      '¿Revelar sorpresa ahora?',
      `Tu pareja (${partnerName}) podrá ver el título y los detalles de esta sorpresa inmediatamente en su calendario.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revelar ✨',
          onPress: () => {
            onRevealNow(event.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    triggerHaptic('success');
    onCompletePlan(event);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <Badge
              variant={event.eventType === 'surprise' ? 'butter' : event.eventType === 'important_date' ? 'primary' : 'mistBlue'}
              size="md"
            >
              {event.eventType === 'surprise' ? (event.isOwner ? '🔒 Sorpresa tuya' : '✨ Sorpresa para ti') : event.eventType === 'important_date' ? '💛 Fecha importante' : '🍷 Plan juntos'}
            </Badge>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: '#66737C', fontWeight: '800' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Title & Subtitle */}
            <Text style={styles.titleText}>{event.title}</Text>

            {event.subtitle ? (
              <Text style={styles.subtitleText}>{event.subtitle}</Text>
            ) : null}

            {/* Date & Time Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📅</Text>
                <View>
                  <Text style={styles.infoLabel}>FECHA</Text>
                  <Text style={styles.infoValue}>{formatDateNice(event.date)}</Text>
                </View>
              </View>

              {event.time ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoEmoji}>⏰</Text>
                  <View>
                    <Text style={styles.infoLabel}>HORA</Text>
                    <Text style={styles.infoValue}>{event.time}</Text>
                  </View>
                </View>
              ) : null}

              {event.locationName ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoEmoji}>📍</Text>
                  <View>
                    <Text style={styles.infoLabel}>LUGAR</Text>
                    <Text style={styles.infoValue}>{event.locationName}</Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Countdown Banner */}
            {daysUntil >= 0 && (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownText}>
                  {daysUntil === 0 ? '✨ ¡Es hoy! Que disfrutéis al máximo.' : `⏳ Faltan ${daysUntil} ${daysUntil === 1 ? 'día' : 'días'} para este momento.`}
                </Text>
              </View>
            )}

            {/* Private Notes Checklist for Creator */}
            {event.isOwner && event.notes && event.notes.length > 0 && (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>🔒 NOTAS PRIVADAS & CHECKLIST (Solo tú lo ves)</Text>
                {event.notes.map((n, idx) => (
                  <View key={idx} style={styles.noteItem}>
                    <Text style={styles.noteDot}>✓</Text>
                    <Text style={styles.noteText}>{n}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Partner Secret Teaser Box */}
            {!event.isOwner && !event.isRevealed && event.eventType === 'surprise' && (
              <View style={styles.mysteryTeaserBox}>
                <Text style={styles.mysteryEmoji}>🎁</Text>
                <Text style={styles.mysteryTitle}>¡Es una sorpresa preparada para ti!</Text>
                <Text style={styles.mysteryDesc}>
                  {partnerName} ha preparado este plan con mucho cariño. Los detalles se desvelarán cuando llegue el momento.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsColumn}>
              {event.isOwner && !event.isRevealed && event.eventType === 'surprise' && (
                <Button
                  variant="outline"
                  size="md"
                  onPress={handleReveal}
                  style={{ marginBottom: Spacing.xs }}
                >
                  ✨ Revelar sorpresa a {partnerName} ahora
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onPress={handleComplete}
              >
                ✓ Marcar como vivido / Guardar recuerdo
              </Button>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 27, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(253, 252, 250, 0.90)' : '#FFFFFF',
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
    maxHeight: '90%',
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
    ...Shadows.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(43, 33, 41, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: Spacing.xl,
  },
  titleText: {
    ...Typography.h1,
    fontSize: 22,
    color: '#1E252B',
    lineHeight: 28,
    marginBottom: 4,
  },
  subtitleText: {
    ...Typography.body,
    fontSize: 14,
    color: '#66737C',
    marginBottom: Spacing.lg,
  },
  infoCard: {
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoLabel: {
    ...Typography.overline,
    fontSize: 9.5,
    color: '#66737C',
    letterSpacing: 0.8,
  },
  infoValue: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: '#1E252B',
    fontWeight: '700',
  },
  countdownBox: {
    backgroundColor: '#FDEEEB',
    padding: Spacing.md,
    borderRadius: Radii.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 88, 0.2)',
  },
  countdownText: {
    ...Typography.captionBold,
    color: '#E86A58',
    fontSize: 12.5,
  },
  notesBox: {
    backgroundColor: '#FAF7FD',
    padding: Spacing.lg,
    borderRadius: Radii.xl,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3.5,
    borderLeftColor: '#E86A58',
  },
  notesTitle: {
    ...Typography.overline,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#E86A58',
    marginBottom: Spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  noteDot: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E86A58',
  },
  noteText: {
    ...Typography.body,
    fontSize: 13,
    color: '#1E252B',
  },
  mysteryTeaserBox: {
    backgroundColor: '#FAF7FD',
    padding: Spacing.xl,
    borderRadius: Radii.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 123, 181, 0.2)',
  },
  mysteryEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  mysteryTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: '#1E252B',
    textAlign: 'center',
    marginBottom: 4,
  },
  mysteryDesc: {
    ...Typography.caption,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#66737C',
    textAlign: 'center',
  },
  actionsColumn: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
