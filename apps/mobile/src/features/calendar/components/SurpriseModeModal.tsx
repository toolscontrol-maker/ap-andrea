import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { SurpriseActivationMode } from '../domain/calendar.types';
import { triggerHaptic } from '../../../utils/haptics';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';

interface SurpriseModeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: SurpriseActivationMode) => void;
  partnerName: string;
}

const MODES = [
  {
    id: 'self' as SurpriseActivationMode,
    title: 'Solo para mí',
    subtitle: 'Yo preparo algo para ti.',
    desc: 'Tu pareja verá únicamente lo que decidas mostrarle y en el momento exacto que tú elijas.',
    emoji: '🎁',
  },
  {
    id: 'invite' as SurpriseActivationMode,
    title: 'Invitar a mi pareja',
    subtitle: 'Enviar una señal discreta a tu pareja.',
    desc: '“Me gustaría que prepararas algo bonito para nosotros. ¿Te apetece activar el modo sorpresa?”',
    emoji: '💌',
  },
  {
    id: 'both' as SurpriseActivationMode,
    title: 'Los dos',
    subtitle: 'Cada uno preparará algo para el otro.',
    desc: 'Cada uno solo ve sus propias notas. Sistema anti-spoiler total para ambos.',
    emoji: '✨',
  },
  {
    id: 'total_secret' as SurpriseActivationMode,
    title: 'Sorpresa total',
    subtitle: '100% secreto sin avisos previos.',
    desc: 'Tu pareja no sabrá nada hasta el momento exacto de la revelación.',
    emoji: '🔒',
  },
];

export function SurpriseModeModal({
  visible,
  onClose,
  onSelectMode,
  partnerName,
}: SurpriseModeModalProps) {
  if (!visible) return null;

  const handlePressOption = (mode: SurpriseActivationMode) => {
    triggerHaptic('medium');
    if (mode === 'invite') {
      Alert.alert(
        'Invitación enviada ✨',
        `Le hemos enviado una señal discreta a ${partnerName}: "Me gustaría que prepararas algo bonito para nosotros. ¿Te apetece activar el modo sorpresa?"`
      );
      onClose();
      return;
    }
    onSelectMode(mode);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <Text style={styles.title}>¿Cómo queréis usar el Modo Sorpresa?</Text>
          <Text style={styles.subtitle}>
            Elige la dinámica que mejor se adapta a lo que tienes en mente.
          </Text>

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {MODES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionCard}
                onPress={() => handlePressOption(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.emojiBox}>
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
    ...Shadows.lg,
    maxHeight: '85%',
    zIndex: 10,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(43, 33, 41, 0.15)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    fontSize: 19,
    color: '#1E252B',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.caption,
    fontSize: 12.5,
    color: '#66737C',
    marginBottom: Spacing.lg,
  },
  optionsList: {
    maxHeight: 420,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF6F0',
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(43, 33, 41, 0.06)',
    gap: Spacing.md,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  optionTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: '#1E252B',
    fontWeight: '800',
  },
  optionSubtitle: {
    ...Typography.captionBold,
    fontSize: 11.5,
    color: '#E86A58',
    marginTop: 1,
    marginBottom: 3,
  },
  optionDesc: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 16,
    color: '#66737C',
  },
});
