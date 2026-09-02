import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { Radii, Shadows, Spacing, Typography } from '../../../theme/tokens';
import { Colors } from '../../../theme/colors';
import { triggerHaptic } from '../../../utils/haptics';
import { UniversalEventType } from '../domain/calendar.types';

interface UniversalCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: UniversalEventType) => void;
  selectedDate: string;
  partnerName: string;
}

interface MenuOption {
  id: UniversalEventType;
  title: string;
  subtitle: string;
  emoji: string;
  iconBg: string;
  borderColor: string;
}

const MENU_OPTIONS: MenuOption[] = [
  {
    id: 'date',
    title: 'Plan o Cita',
    subtitle: 'Tarde juntos, cena romántica o escapada de un día',
    emoji: '♡',
    iconBg: 'rgba(224, 86, 102, 0.12)',
    borderColor: '#E05666',
  },
  {
    id: 'restaurant',
    title: 'Reserva / Restaurante',
    subtitle: 'Elige un sitio de vuestra lista o añade una nueva mesa',
    emoji: '🍽️',
    iconBg: 'rgba(212, 175, 55, 0.12)',
    borderColor: '#D4AF37',
  },
  {
    id: 'surprise',
    title: 'Sorpresa Secreta',
    subtitle: 'Prepara algo especial con pistas y fecha de revelación',
    emoji: '✦',
    iconBg: 'rgba(232, 106, 88, 0.12)',
    borderColor: '#E86A58',
  },
  {
    id: 'trip',
    title: 'Viaje o Escapada',
    subtitle: 'Varios días desconectando y descubriendo nuevos rincones',
    emoji: '✈️',
    iconBg: 'rgba(92, 159, 154, 0.12)',
    borderColor: '#5C9F9A',
  },
  {
    id: 'wishlist',
    title: 'Recordatorio para un Deseo',
    subtitle: 'Fija una fecha para cumplir una ilusión de la Wishlist',
    emoji: '🎁',
    iconBg: 'rgba(212, 175, 55, 0.15)',
    borderColor: '#D4AF37',
  },
  {
    id: 'reminder',
    title: 'Recordatorio Básico',
    subtitle: 'Aviso simple de cita, recado o nota para los dos',
    emoji: '📌',
    iconBg: 'rgba(131, 169, 140, 0.15)',
    borderColor: '#83A98C',
  },
  {
    id: 'important_date',
    title: 'Fecha Importante / Aniversario',
    subtitle: 'Un día imprescindible para vuestra historia de amor',
    emoji: '◌',
    iconBg: 'rgba(109, 158, 123, 0.12)',
    borderColor: '#6D9E7B',
  },
  {
    id: 'memory',
    title: 'Recuerdo de Hoy',
    subtitle: 'Inmortaliza lo vivido hoy con foto y sentimiento',
    emoji: '📷',
    iconBg: 'rgba(138, 123, 181, 0.12)',
    borderColor: '#8A7BB5',
  },
];

export function UniversalCreateModal({
  visible,
  onClose,
  onSelectOption,
  selectedDate,
  partnerName,
}: UniversalCreateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdropOverlay} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheetCard}>
          {/* Header Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Title Header */}
          <View style={styles.headerRow}>
                <View>
                  <Text style={styles.headerEyebrow}>NUESTRO TIEMPO JUNTOS</Text>
                  <Text style={styles.headerTitle}>¿Qué queréis guardar?</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Spacing.lg }}
              >
                {MENU_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={styles.optionRow}
                    onPress={() => {
                      triggerHaptic('medium');
                      onSelectOption(opt.id);
                    }}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: opt.iconBg },
                      ]}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    </View>

                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>{opt.title}</Text>
                      <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                    </View>

                    <Text style={styles.chevronText}>›</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radii['2xl'],
    borderTopRightRadius: Radii['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? Spacing['2xl'] + 10 : Spacing.xl,
    maxHeight: '82%',
    ...Shadows.lg,
    zIndex: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  sheetHandle: {
    width: 36,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(20, 19, 18, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 19, 18, 0.06)',
  },
  headerEyebrow: {
    ...Typography.captionBold,
    fontSize: 10.5,
    letterSpacing: 1.5,
    color: Colors.light.primary,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18.5,
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 19, 18, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
  scrollView: {
    marginTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(20, 19, 18, 0.05)',
    ...Shadows.subtle,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  optionTitle: {
    ...Typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.light.textMuted,
    lineHeight: 16,
  },
  chevronText: {
    fontSize: 20,
    color: 'rgba(20, 19, 18, 0.3)',
    fontWeight: '300',
  },
});
